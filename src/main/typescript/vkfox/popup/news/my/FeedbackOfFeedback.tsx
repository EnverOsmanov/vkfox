import * as React from "react"
import Item from "../../item/Item";
import {ReplyI} from "../../chat/types";
import AttachmentC from "../../attachment/AttachmentC";
import I18N from "../../../i18n/i18n";
import RectifyPu from "../../../rectify/rectify.pu";
import {FeedbackObj, ReplyFeedback} from "../../../feedbacks/types";
import {GroupProfile, UserProfile} from "../../../back/users/types";
import ItemActionLike from "../../itemActions/ItemActionLike";


interface FeedbackItemProps {
    feedback: FeedbackObj
    owner  ?: UserProfile | GroupProfile
}

interface FeedbackItemState {
    message : string
    reply   : ReplyI
}

class FeedbackOfFeedback extends React.Component<FeedbackItemProps, FeedbackItemState> {

    constructor(props) {
        super(props);

        const reply: ReplyI = {
            visible: false
        };

        this.state = {
            message: "",
            reply
        };
    }

    commentFeedback = (commentFeedback: ReplyFeedback) => {
        const attachments = commentFeedback.attachments
            ? commentFeedback.attachments.map((attachment, i) => {
                return (
                    <AttachmentC
                        key={i}
                        type={attachment.type}
                        data={attachment[attachment.type]}
                        showFullWidth={commentFeedback.attachments.length === 1}
                    />
                )
            }) : null;

        return (
            <div>
                <RectifyPu text={commentFeedback.text} hasEmoji={false}/>
                {attachments}

                {/*<div className="subfeedback__actions">
                </div>*/}
            </div>
        );
    };

    feedbackElm = (feedback: FeedbackObj) => {
        switch (feedback.type) {
            case "comment":
            case "comments":
            case "reply":
                return this.commentFeedback(feedback.feedback as ReplyFeedback);

            case "like":
                return (
                    <span>
                        {I18N.get("Liked")}
                        <i className="fa fa-heart"/>
                    </span>
                );

            case "copy":
                return (
                    <span>
                        {I18N.get("Reposted")}
                        <i className="fa fa-retweet"/>
                    </span>
                );

            case "wall_publish":
                return (
                    <span>
                        {I18N.get("wall_publish")}
                        <i className="fa fa-plane"/>
                    </span>
                );

            default:
                console.debug("Unknown FeedbackOfFeedback", feedback.type);
                break;
        }
    };



    render() {
        const {feedback, owner} = this.props;

        return (
            <Item
                itemClass="subfeedback"
                ownerClass="item__img"
                owners={owner}>
                <div className="item__body clearfix">
                    {this.feedbackElm(feedback)}

                </div>
            </Item>
        )
    }
}

export default FeedbackOfFeedback