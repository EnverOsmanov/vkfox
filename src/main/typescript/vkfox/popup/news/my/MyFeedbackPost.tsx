"use strict";

import * as React from "react"
import AttachmentC from "../../attachment/AttachmentC";
import I18N from "../../../i18n/i18n";
import RectifyPu from "../../../rectify/rectify.pu";
import {TopicFeedback, WallMentionFeedback} from "../../../feedbacks/types";
import {FeedbackItemObj} from "../types";


interface MyFeedbackPostProps {
    item: FeedbackItemObj
}

class MyFeedbackPost extends React.Component<MyFeedbackPostProps, undefined> {

    postCommentOrWallElm = (item: FeedbackItemObj) => {
        const postParent = item.parent as WallMentionFeedback;
        const attachments = postParent.attachments
            ? postParent.attachments.map((attachment, i) => {
                    return (
                        <AttachmentC
                            key={i}
                            type={attachment.type}
                            data={attachment[attachment.type]}
                        />
                    )
                }
            ) : null;

        const text = postParent.text &&
            <span>
                <RectifyPu text={postParent.text} hasEmoji={false}/>
            </span>;

        return (
            <div>
                {text}
                {attachments}
            </div>
        );
    };

    myFeedbackPost = (item: FeedbackItemObj) => {

        switch (item.type) {
            case "photo":
            case "video":
                return <AttachmentC type={item.type} data={item.parent}/>;

            case "topic":
                const topicParent = item.parent as TopicFeedback;
                return <RectifyPu text={topicParent.text} hasEmoji={false}/>;

            case "mention":
                const mentionParent = item.parent as WallMentionFeedback;
                return <RectifyPu text={mentionParent.text} hasEmoji={false}/>;

            case "follow":
                return (
                    <div>
                        {I18N.get("started following you")}
                        <i className="fa fa-user"/>
                    </div>
                );

            case "friend_accepted":
                return (
                    <div>
                        {I18N.get("friend request accepted")}
                        <i className="fa fa-plus"/>
                    </div>
                );


            default:
                const postCommentOrWall =
                    item.type.indexOf("post") !== -1 ||
                    item.type.indexOf("comment") !== -1 ||
                    item.type.indexOf("wall") !== -1;

                if (postCommentOrWall)
                    return this.postCommentOrWallElm(item);
                else {
                    console.warn("Unknown feedback", item);
                    return null
                }
        }
    };


    render() {
        const {item} = this.props;

        return this.myFeedbackPost(item)
    }
}

export default MyFeedbackPost