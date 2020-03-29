import * as React from "react"
import {ReplyI} from "../../chat/types";
import I18N from "../../../../common/i18n/i18n";
import MyFeedbackPost from "./MyFeedbackPost";
import MyFeedbackActions from "./MyFeedbackActions";
import FeedbackOfFeedback from "./FeedbackOfFeedback";
import {FeedbackObj, SendMessageI,} from "../../../../common/feedbacks/types";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {FeedbackItemObj} from "../types";
import {getActionsData, onReply} from "../news.pu";
import ReplyMessage from "../../components/reply/ReplyMessage";
import ItemHero from "../../components/item/ItemHero";


interface FeedbackItemProps {
    item        : FeedbackItemObj
    itemProfile : UserProfile | GroupProfile
    profiles    : Map<number, UserProfile| GroupProfile>
}

interface FeedbackItemState {
    message         : string
    reply           : ReplyI
    showAllFeedbacks: boolean
}

class FeedbackItem extends React.Component<FeedbackItemProps, FeedbackItemState> {

    public readonly state = FeedbackItemCpn.initialState;

    showOrHideReply = () => {
        this.setState(prevState => {
            const visible = !this.state.reply.visible;

            const reply: ReplyI = {
                visible
            };

            return {
                ...prevState,
                reply
            }
        })
    };

    handleMessageChange = (message: string) => {
        this.setState(prevState => {
            return {
                ...prevState,
                message
            }
        })
    };

    sendMessage = (scope?: SendMessageI) => {
        this.showOrHideReply();

        return scope ?
            onReply(scope, this.state.message)
            .then(() => this.handleMessageChange(""))

            : console.warn("Couldn't send message - no scope");
    };

    changeShowAllFeedback = () => {
        this.setState(prevState => {
            const showAllFeedbacks = !prevState.showAllFeedbacks;

            return {
                ...prevState,
                showAllFeedbacks
            }
        })
    };

    showAllSwithcher = (item: FeedbackItemObj) => {
        const text = this.state.showAllFeedbacks
            ? "hide"
            : "show all";

        const buttonStatus = this.state.showAllFeedbacks
            ? "btn-pressed"
            : "";

        if (item.feedbacks && item.feedbacks.length > 3) return (
            <span
                className={`btn news__show-all ${buttonStatus}`}
                onClick={() => this.changeShowAllFeedback()}>
                {I18N.get(text)}
            </span>
        )
    };

    feedbacks = (item: FeedbackItemObj) => {
        const sliceI = this.state.showAllFeedbacks ? 0 : -3;

        const singleFeedback = (feedback: FeedbackObj) => {
            const owner = this.props.profiles.get(Math.abs(feedback.feedback.owner_id));

            return (
                <FeedbackOfFeedback
                    key={feedback.id}
                    owner={owner}
                    feedback={feedback}
                />
            )
        };

        return item.feedbacks
            .slice(sliceI)
            .map(singleFeedback)
    };


    render() {
        const {item, itemProfile} = this.props;
        const actionsData = getActionsData(item.type, item.parent);

        return (
            <div className="item card-1 scrollable-card">

                <ItemHero
                    owners={itemProfile}
                    ownerClass="item__img"
                />

                <div className="item__body clearfix">

                    <MyFeedbackPost item={item}/>

                    <MyFeedbackActions
                        item={item}
                        actionsData={actionsData}
                        showOrHideReply={this.showOrHideReply}
                    />

                    {this.showAllSwithcher(item)}

                    {this.feedbacks(item)}
                </div>

                <ReplyMessage
                    reply={this.state.reply}
                    message={this.state.message}
                    sendMessage={() => this.sendMessage(actionsData)}
                    handleMessageChange={this.handleMessageChange}
                />

            </div>
        )
    }
}

export default FeedbackItem


class FeedbackItemCpn {

    private static reply: ReplyI = {
        visible: false
    };

    static initialState = {
        message         : "",
        reply           : FeedbackItemCpn.reply,
        showAllFeedbacks: false
    };

}