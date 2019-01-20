"use strict";

import * as React from "react"
import AttachmentC from "../../components/attachment/AttachmentC";
import I18N from "../../../../common/i18n/i18n";
import RectifyPu from "../../../../rectify/RectifyPu";
import {ParentObjPost, TopicParFromComm} from "../../../../common/feedbacks/types";
import {FeedbackItemObj} from "../types";
import {WithCopyHistory} from "../../../../../vk/types/newsfeed";
import {AttachmentContainer} from "../../../../../vk/types/attachment";


interface MyFeedbackPostProps {
    item: FeedbackItemObj
}

class MyFeedbackPost extends React.Component<MyFeedbackPostProps, object> {

    static repostsElm(itemPost: WithCopyHistory): JSX.Element[] {
        function repostElm(originP: ParentObjPost, i: number): JSX.Element {
            if (originP.text || originP.attachments) {
                return (
                    <div key={i}>
                        <i className="news__post_repost fa fa-bullhorn"/>

                        <RectifyPu text={originP.text} hasEmoji={false}/>

                        {MyFeedbackPost.postAttachmentElms(originP)}
                    </div>
                )
            }
            else return null;
        }

        return itemPost.copy_history
            ? itemPost.copy_history.map(repostElm)
            : null;
    };

    static postAttachmentElms(postParent: ParentObjPost): JSX.Element[] | null {
        function singleAttachment(attachment: AttachmentContainer, i: number): JSX.Element {

            return (
                <AttachmentC
                    key={i}
                    type={attachment.type}
                    data={attachment[attachment.type]}
                    showFullWidth={postParent.attachments.length === 1}
                />
            )
        }

        return postParent.attachments
            ? postParent.attachments.map(singleAttachment)
            : null;
    }

    static postCommentOrWallElm(item: FeedbackItemObj): JSX.Element {
        const postParent = item.parent as ParentObjPost;
        const attachments = MyFeedbackPost.postAttachmentElms(postParent);

        const text = postParent.text &&
            <RectifyPu text={postParent.text} hasEmoji={false}/>;

        return (
            <div className="item__post">
                {text}
                {MyFeedbackPost.repostsElm(postParent)}
                {attachments}
            </div>
        );
    };

    static myFeedbackPost(item: FeedbackItemObj): JSX.Element | null {

        switch (item.type) {
            case "photo":
            case "video":
                return (
                    <AttachmentC
                        type={item.type}
                        data={item.parent}
                        showFullWidth={true}
                    />
                );

            case "topic":
                const topicParent = item.parent as TopicParFromComm;
                return <RectifyPu text={topicParent.text} hasEmoji={false}/>;

            case "mention":
                const mentionParent = item.parent as ParentObjPost;
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
                    return MyFeedbackPost.postCommentOrWallElm(item);
                else {
                    console.warn("Unknown feedback", item);
                    return null
                }
        }
    };


    render() {
        const {item} = this.props;

        return MyFeedbackPost.myFeedbackPost(item)
    }
}

export default MyFeedbackPost