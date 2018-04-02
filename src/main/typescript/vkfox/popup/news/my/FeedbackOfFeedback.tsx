import * as React from "react"
import Item from "../../item/Item";
import {FeedbackObj, ReplyFeedback} from "../../../feedbacks/collections/FeedBacksCollection";
import {ReplyI} from "../../../chat/Chat";
import AttachmentC from "../../attachment/AttachmentC";
import I18N from "../../../i18n/i18n";
import RectifyPu from "../../../rectify/rectify.pu";


interface FeedbackItemProps {
    feedback: FeedbackObj
    owners
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
                    />
                )
            }) : null;

        return (
            <div>

                <span>
                    <RectifyPu text={commentFeedback.text} hasEmoji={false}/>
                </span>
                {attachments}
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
        const feedback = this.props.feedback;

        return (
            <Item
                owners={this.props.owners}
                reply={this.state.reply}>
                {this.feedbackElm(feedback)}
            </Item>
        )
    }
}

export default FeedbackOfFeedback