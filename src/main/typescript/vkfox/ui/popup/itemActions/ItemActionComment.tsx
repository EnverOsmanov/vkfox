import * as React from "react"
import I18N from "../../../common/i18n/i18n";

interface ItemActionProps {
    showIf  : boolean

    showOrHideReply(): void
}

class ItemActionComment extends React.Component<ItemActionProps> {

    render() {
        return this.props.showIf
            ?
            <i
                className="item__action fa fa-comment"
                title={I18N.get("Comment")}
                onClick={_ => this.props.showOrHideReply()}
            />
            : null
    }
}

export default ItemActionComment
