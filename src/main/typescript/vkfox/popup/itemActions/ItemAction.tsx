import * as React from "react"
import {MouseEventHandler} from "react";

interface ItemActionProps {
    className: string
    title    : string
    anchor  ?: string
    hidden  ?: boolean
    onClick ?: MouseEventHandler<any>
}

class ItemAction extends React.Component<ItemActionProps> {

    render() {
        return (
            <i
                className={`item__action ${this.props.className}`}
                title={this.props.title}
                onClick={this.props.onClick}
                data-anchor={this.props.anchor}
                data-toggle="tooltip"
            />
        )
    }
}

export default ItemAction
