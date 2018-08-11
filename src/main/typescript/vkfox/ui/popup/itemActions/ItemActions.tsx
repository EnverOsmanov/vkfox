import * as React from "react"

const ItemActions: React.SFC = props => {
        return (
            <div className="item__actions">
                {props.children}
            </div>
        )
};

export default ItemActions
