import * as React from "react"
import {ItemObj} from "../../../feedbacks/collections/ItemColl";
import AttachmentC from "../../../attachment/AttachmentC";
import {TopicFeedback, WallPostMentionFeedback} from "../../../feedbacks/collections/FeedBacksCollection";
import I18N from "../../../i18n/i18n";
import {rectifyPu} from "../../../rectify/rectify.pu";


interface MyFeedbackPostProps {
    item: ItemObj
}

class MyFeedbackPost extends React.Component<MyFeedbackPostProps, undefined> {

    postCommentOrWallElm = (item: ItemObj) => {
        const postParent = item.parent as WallPostMentionFeedback;
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
            <span dangerouslySetInnerHTML={{__html: rectifyPu()(postParent.text, false)}}/>;

        return (
            <div>
                {text}
                {attachments}
            </div>
        );
    };

    myFeedbackPost = (item: ItemObj) => {

        switch (item.type) {
            case "photo":
            case "video":
                return <AttachmentC type={item.type} data={item.parent}/>;

            case "topic":
                const topicParent = item.parent as TopicFeedback;
                return <div>{topicParent.text}</div>;

            case "mention":
                const mentionParent = item.parent as WallPostMentionFeedback;
                return <div>{mentionParent.text}</div>;

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
        const item = this.props.item;

        return this.myFeedbackPost(item)
    }
}

export default MyFeedbackPost