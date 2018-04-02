import * as React from "react"
import I18N from "../../i18n/i18n";
import {LikesObj, NewsLikesObj} from "../../feedbacks/collections/FeedBacksCollection";
import Msg from "../../mediator/messages";
import Mediator from "../../mediator/mediator.pu"


interface ItemActionProps {
    ownerId : number
    itemId  : number
    likes   : LikesObj
    type   ?: string
    hidden ?: boolean
}

class ItemActionLike extends React.Component<ItemActionProps> {
    handleLikeClick = () => {
        const scope = this.props;

        const lukas = {
            action  : scope.likes.user_likes ? 'delete':'add',
            type    : scope.type || 'post',
            owner_id: scope.ownerId,
            item_id : scope.itemId
        };

        Mediator.pub(Msg.LikesChange, lukas);
    };

    render() {
        const likes = this.props.likes as NewsLikesObj;
        const show = likes.can_like || likes.user_likes || (likes && likes.can_like === undefined);
        const myClassName = likes.user_likes ? "item__action-like_liked" : "";

        if (!this.props.hidden && show)
            return (
                <i
                    className={`item__action fa fa-heart ${myClassName}`}
                    title={I18N.get("Like")}
                    onClick={this.handleLikeClick}
                />
            )
    }
}

export default ItemActionLike
