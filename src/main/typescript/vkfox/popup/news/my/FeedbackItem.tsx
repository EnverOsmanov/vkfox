import * as React from "react"
import Item from "../../item/Item";
import {FeedbackObj, WallPostMentionFeedback} from "../../../feedbacks/collections/FeedBacksCollection";
import {ReplyI} from "../../../chat/Chat";
import I18N from "../../../i18n/i18n";
import {ItemObj} from "../../../feedbacks/collections/ItemColl";
import {ProfileI} from "../../../chat/collections/ProfilesColl";
import MyFeedbackPost from "./MyFeedbackPost";
import MyFeedbackActions from "./MyFeedbackActions";
import FeedbackOfFeedback from "./FeedbackOfFeedback";
import {SendMessageI} from "../../itemActions/types";
import NewsFeedItem from "../feed/NewsFeedItem";


interface FeedbackItemProps {
    item: ItemObj
    itemProfile: ProfileI
    profiles: ProfileI[]
}

interface FeedbackItemState {
    message         : string
    reply           : ReplyI
    showAllFeedbacks: boolean
}

class FeedbackItem extends React.Component<FeedbackItemProps, FeedbackItemState> {

    constructor(props) {
        super(props);

        const reply: ReplyI = {
            visible: false
        };

        this.state = {
            message: "",
            reply,
            showAllFeedbacks: false
        };
    }

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

    sendMessage = () => {
        this.showOrHideReply();

        const item = this.props.item;
        if (item.parent.type == "post") {
            const parent = item.parent as WallPostMentionFeedback;

            const scope: SendMessageI = {
                type    : item.type,
                id      : parent.post_id,
                ownerId : parent.owner_id
            };

            return NewsFeedItem.onReply(scope, this.state.message)
                .then(() => this.handleMessageChange(""))
                .catch(err => console.error("Couldn't send message", err));
        }
        else console.warn("This feedback is not post, but you was able to send message", item)
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

    showAll = (item: ItemObj) => {
        const text = this.state.showAllFeedbacks ? "hide" : "show all";

        if (item.feedbacks && item.feedbacks.length > 3) return (
            <span
                className="btn news__show-all"
                onClick={() => this.changeShowAllFeedback()}>
                {I18N.get(text)}
            </span>
        )
    };

    feedbacks = (item: ItemObj) => {
        const sliceI = this.state.showAllFeedbacks ? 0 : -3;

        const singleFeedback = (feedback: FeedbackObj) => {
            const owners = this.props.profiles.find(profile => profile.id === feedback.feedback.owner_id);

            return (
                <FeedbackOfFeedback
                    key={feedback.date}
                    owners={owners}
                    feedback={feedback}
                />
            )
        };

        return item.feedbacks && item.feedbacks.slice(sliceI).map(singleFeedback)
    };


    render() {
        const item = this.props.item;
        const itemProfile = this.props.itemProfile;

        return (
            <Item
                owners={itemProfile}
                reply={this.state.reply}
                sendMessage={() => this.sendMessage()}
                handleMessageChange={this.handleMessageChange}>

                <MyFeedbackPost item={item}/>

                <MyFeedbackActions
                    item={item}
                    showOrHideReply={this.showOrHideReply}
                />

                {this.showAll(item)}

                {this.feedbacks(item)}

            </Item>
        )
    }
}

export default FeedbackItem