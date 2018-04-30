import * as React from "react"
import I18N from "../../i18n/i18n";

interface ItemActionProps {
    type    : string
    ownerId : number
    id      : number
    showIf  : boolean
    replyTo ?: number

    showOrHideReply(): void
}

class ItemActionComment extends React.Component<ItemActionProps> {

    render() {
        return this.props.showIf
            ?
            <i
                className="item__action fa fa-comment"
                title={I18N.get("Comment")}
                onClick={e => this.props.showOrHideReply()}
            />
            : null
    }
}

export default ItemActionComment
