import * as React from "react"
import {CSSProperties} from "react"
import {ReplyI} from "../chat/Chat";
import {ProfileI} from "../chat/collections/ProfilesColl";
import {addVKBase, profile2Name} from "../filters/filters.pu";

interface ItemProps {
    owners      : ProfileI | ProfileI[],
    reply       : ReplyI
    itemClass  ?: string
    message    ?: string
    description?: string
    title      ?: string

    sendMessage         ?: () => void
    handleMessageChange ?: (event) => void
}


class Item extends React.Component<ItemProps> {

    ownerDiv = () => {
        const owners = this.props.owners;
        const divForArray = (
            <div className="item__img">
                <i className="fa fa-user"/>{(owners as ProfileI[]).length}
            </div>
        );

        const divForNotArray = () => {
            const cssProps: CSSProperties = {
                backgroundImage: `url(${(owners as ProfileI).photo})`
            };

            const owner = owners as ProfileI;
            const anchor = owner.uid && owner.uid > 0
                ? `/id${owner.uid}`
                : `/club${owner.gid}`;

            return (
                <div
                    style={cssProps}
                    data-anchor={addVKBase(anchor)}
                    className="item__img media-object">
                </div>
            );
        };


        return Array.isArray(owners)
            ? divForArray
            : divForNotArray()
    };

    itemName = () => {
        const {owners, title} = this.props;

        return Array.isArray(owners)
            ? title
            : profile2Name(this.props.owners)
    };

    handleMessageChange = (event) => {
        const message = event.target.value;
        this.props.handleMessageChange(message)
    };

    isOnlineClassName = () => {
        const {owners} = this.props;

        return ("online" in owners) && owners.online
            ? "is-online"
            : "";
    };

    handleKeyPress = (event: React.KeyboardEvent<any>) => {
        if (event.key == "Enter") this.props.sendMessage()
    };


    replyElm = () => {
        const reply = this.props.reply;

        return reply.visible
            ?
            <div className="item__reply">
                <textarea
                    autoFocus={true}
                    onKeyPress={this.handleKeyPress}
                    value={this.props.message}
                    onChange={this.handleMessageChange}
                />
            </div>
            : null
    };

    descriptionElm = () => {
        const description = this.props.description;

        return description
            ?
            <span
                className="item__description">
                {this.props.description}
            </span>
            : null
    };

    render() {
        const itemClass = this.props.itemClass || "";

        return (
            <div className={`item ${itemClass}`}>

                <div className="item__header">
                    <div className="pull-left">
                        {this.ownerDiv()}
                    </div>
                    <span className={`item__title ${this.isOnlineClassName()}`}>
                        <span className="item__author">
                            {this.itemName()}
                        </span>

                        {this.descriptionElm()}
                    </span>
                </div>

                <div className="item__body clearfix">
                    {this.props.children}
                </div>


                {this.replyElm()}
            </div>
        )
    }
}

export default Item
