import * as React from "react"
import {ReplyI} from "../../chat/types";
import AttachmentC from "../../components/attachment/AttachmentC";
import I18N from "../../../../common/i18n/i18n";
import RectifyPu from "../../../../rectify/RectifyPu";
import {FeedbackObj, ReplyFeedback} from "../../../../common/feedbacks/types";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import ItemHero from "../../components/item/ItemHero";


interface FeedbackItemProps {
    feedback: FeedbackObj
    owner  ?: UserProfile | GroupProfile
}

interface FeedbackItemState {
    message : string
    reply   : ReplyI
}

class FeedbackOfFeedback extends React.Component<FeedbackItemProps, FeedbackItemState> {

    public readonly state = FeedbackOfFeedbackCpn.initialState;

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
                console.warn("Unknown FeedbackOfFeedback", feedback.type);
                break;
        }
    };



    render() {
        const {feedback, owner} = this.props;

        return (
            <div className="item subfeedback">

                <ItemHero
                    owners={owner}
                    ownerClass="item__img"
                />

                <div className="item__body clearfix">

                    {this.feedbackElm(feedback)}

                </div>
            </div>
        )
    }
}

export default FeedbackOfFeedback

class FeedbackOfFeedbackCpn {
    private static reply: ReplyI = {
        visible: false
    };

    static initialState: FeedbackItemState = {
        message : "",
        reply   : FeedbackOfFeedbackCpn.reply
    };
}