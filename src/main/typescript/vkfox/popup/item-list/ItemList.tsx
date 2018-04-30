import * as React from "react"


class ItemList extends React.Component {


    render() {
        return(
            <div className="item-list">
                <div className="item-list__content">
                    <div className="item-list__scroll">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}

export default ItemList;