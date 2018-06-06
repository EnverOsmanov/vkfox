import * as React from "react"
import ItemActions from "../../itemActions/ItemActions";
import {CommentsDataI, getCommentsData, getSourceLink, unsubscribe} from "../news.pu";
import {Capitalize} from "../../filters/filters.pu";
import I18N from "../../../i18n/i18n";
import ItemAction from "../../itemActions/ItemAction";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemActionLike from "../../itemActions/ItemActionLike";
import {ParentObj, ParentObjPost, TopicFeedbackFromComm} from "../../../feedbacks/types";
import {FeedbackItemObj} from "../types";


interface MyFeedbackActionsProps {
    item: FeedbackItemObj

    showOrHideReply(): void
}

class MyFeedbackActions extends React.Component<MyFeedbackActionsProps, object> {


    actionComment = (comment: CommentsDataI) => {
        if (comment)
            return (
                <ItemActionComment
                    showIf={!!comment}
                    ownerId={comment.ownerId}
                    replyTo={comment.replyTo}
                    id={comment.id}
                    type={comment.type}
                    showOrHideReply={this.props.showOrHideReply}
                />
            )
    };

    actionLike = (comment: CommentsDataI, parent: ParentObj) => {
        if ("likes" in parent) {
            const type = comment.type === "topic"
                ? "topic_comment"
                : comment.type;

            return (
                <ItemActionLike
                    type={type}
                    ownerId={comment.ownerId}
                    itemId={comment.id}
                    likes={(parent as ParentObjPost | TopicFeedbackFromComm).likes}
                />
            )
        }
    };

    actionOpenLink = () => {
        const {item} = this.props;
        const link = getSourceLink(item.type, item.parent);

        return link
            ?
            <ItemAction
                anchor={link}
                className="fa fa-external-link-square"
                title={I18N.get("Open in New Tab")}
            />
            : null
    };

    render() {
        const {item} = this.props;
        try {
            const comment = getCommentsData(item.type, item.parent);

            if (comment) {

                return (
                    <ItemActions>

                        <i
                            onClick={() => unsubscribe(comment.type, comment.ownerId, comment.id)}
                            title={Capitalize(I18N.get("unsubscribe"))}
                            className="item__action fa fa-ban"
                        />

                        {this.actionOpenLink()}
                        {this.actionComment(comment)}
                        {this.actionLike(comment, item.parent)}

                    </ItemActions>
                )
            }
            else return null;
        }
        catch (e) {
            console.warn("Trouble in MyFeedbackActions for item", item, e);
            return null;
        }
    }
}

export default MyFeedbackActions