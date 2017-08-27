import * as React from "react"

interface ItemActionsProps {

}

class ItemActions extends React.Component<ItemActionsProps> {

    render() {
        return (
            <div className="item__actions">
                {this.props.children}
            </div>
        )
    }
}

export default ItemActions
