import * as React from "react"
import Item from "../../item/Item";
import {ReplyI} from "../../chat/types";
import I18N from "../../../i18n/i18n";
import MyFeedbackPost from "./MyFeedbackPost";
import MyFeedbackActions from "./MyFeedbackActions";
import FeedbackOfFeedback from "./FeedbackOfFeedback";
import {SendMessageI} from "../../itemActions/types";
import {CommentsNewsItemWithId, FeedbackObj, ParentObjComment, ParentObjPost} from "../../../feedbacks/types";
import {GroupProfile, UserProfile} from "../../../back/users/types";
import {FeedbackItemObj} from "../types";
import {onReply} from "../news.pu";


interface FeedbackItemProps {
    item        : FeedbackItemObj
    itemProfile : UserProfile | GroupProfile
    profiles    : UserProfile[]
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
        switch (item.type) {
            case "comment": {

                const parent = (item.parent as ParentObjComment);
                const parentPost = parent.post as CommentsNewsItemWithId;

                const scope: SendMessageI = {
                    type    : item.type,
                    id      : parentPost.id,
                    ownerId : parentPost.from_id,
                    replyTo : parent.id
                };

                return onReply(scope, this.state.message)
                    .then(() => this.handleMessageChange(""))
                    .catch(err => console.error("Couldn't send message", err));
            }

            case "topic":
            case "post": {

                const parent = item.parent as ParentObjPost;

                const scope: SendMessageI = {
                    type    : item.type,
                    id      : parent.post_id,
                    ownerId : parent.owner_id
                };

                return onReply(scope, this.state.message)
                    .then(() => this.handleMessageChange(""))
                    .catch(err => console.error("Couldn't send message", err));
            }

            default:
                console.warn("This feedback is not post, but you was able to send message", item);
                return Promise.resolve();
        }
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
        const text = this.state.showAllFeedbacks ? "hide" : "show all";

        if (item.feedbacks && item.feedbacks.length > 3) return (
            <span
                className="btn news__show-all"
                onClick={() => this.changeShowAllFeedback()}>
                {I18N.get(text)}
            </span>
        )
    };

    feedbacks = (item: FeedbackItemObj) => {
        const sliceI = this.state.showAllFeedbacks ? 0 : -3;

        const singleFeedback = (feedback: FeedbackObj) => {
            const owner = this.props.profiles.find(profile => profile.id === Math.abs(feedback.feedback.owner_id));

            return (
                <FeedbackOfFeedback
                    key={feedback.id}
                    owner={owner}
                    feedback={feedback}
                />
            )
        };

        return item.feedbacks.slice(sliceI).map(singleFeedback)
    };


    render() {
        const {item, itemProfile} = this.props;

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

                {this.showAllSwithcher(item)}

                {this.feedbacks(item)}

            </Item>
        )
    }
}

export default FeedbackItem