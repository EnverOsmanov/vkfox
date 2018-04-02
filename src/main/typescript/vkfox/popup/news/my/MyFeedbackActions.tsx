import * as React from "react"
import {ItemObj} from "../../../feedbacks/collections/ItemColl";
import ItemActions from "../../itemActions/ItemActions";
import {CommentsDataI, getCommentsData, getSourceLink, unsubscribe} from "../news.pu";
import {Capitalize} from "../../filters/filters.pu";
import I18N from "../../../i18n/i18n";
import ItemAction from "../../itemActions/ItemAction";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemActionLike from "../../itemActions/ItemActionLike";
import {FeedbackObj} from "../../../feedbacks/collections/FeedBacksCollection";


interface MyFeedbackActionsProps {
    item: ItemObj

    showOrHideReply(): void
}

class MyFeedbackActions extends React.Component<MyFeedbackActionsProps, undefined> {


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

    actionLike = (comment: CommentsDataI, parent: FeedbackObj) => {
        if (comment)
            return (
                <ItemActionLike
                    hidden={!comment}
                    type={comment.type}
                    ownerId={comment.ownerId}
                    itemId={comment.id}
                    likes={parent.likes}
                />
            )
    };

    actionOpenLink = () => {
        const item = this.props.item;
        const link = getSourceLink(item);

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
        const item = this.props.item;
        const comment = getCommentsData(item);
        const parent = item.parent;

        return (
            <ItemActions>

                <i
                    onClick={() => unsubscribe(comment.type, comment.ownerId, comment.id)}
                    title={Capitalize(I18N.get("unsubscribe"))}
                    className="item__action fa fa-ban"
                />

                {this.actionOpenLink()}
                {this.actionComment(comment)}
                {this.actionLike(comment, parent)}

            </ItemActions>
        )
    }
}

export default MyFeedbackActions