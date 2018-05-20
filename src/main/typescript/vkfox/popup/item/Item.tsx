import * as React from "react"
import {CSSProperties} from "react"
import {ReplyI} from "../chat/types";
import {addVKBase, profile2Name} from "../filters/filters.pu";
import {GroupProfile, ProfileI, UserProfile} from "../../back/users/types";
import {profilePhotoPath} from "./item.pu";

interface ItemProps {
    owners      : UserProfile | UserProfile[] | GroupProfile | GroupProfile[],
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
        const {owners, itemClass} = this.props;

        const ownerClass = itemClass == "chat"
            ? "item__avatar"
            : "item__img";

        const divForArray = (
            <div className={ownerClass}>
                <i className="fa fa-user"/>{(owners as ProfileI[]).length}
            </div>
        );

        const divForNotArray = () => {

            const owner = owners as GroupProfile | UserProfile;
            const photo = profilePhotoPath(owner);

            const anchor = "type" in owner
                ? `/club${owner.id}`
                : `/id${owner.id}`;

            const cssProps: CSSProperties = {
                backgroundImage: `url(${photo})`
            };

            return (
                <div
                    style={cssProps}
                    data-anchor={addVKBase(anchor)}
                    className={ownerClass}>
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
            : profile2Name(owners)
    };

    handleMessageChange = (event) => {
        const message = event.target.value;
        this.props.handleMessageChange(message)
    };

    isOnlineClassName = () => {
        const {owners} = this.props;

        return ("online" in owners) && (owners as UserProfile).online
            ? "is-online"
            : "";
    };

    handleKeyPress = (event: React.KeyboardEvent<any>) => {
        if (event.key == "Enter") this.props.sendMessage()
    };


    replyElm = () => {
        const {reply, message} = this.props;

        return reply.visible
            ?
            <div className="item__reply">
                <textarea
                    autoFocus={true}
                    onKeyPress={this.handleKeyPress}
                    value={message}
                    onChange={this.handleMessageChange}
                />
            </div>
            : null
    };

    descriptionElm = () => {
        const {description} = this.props;

        return description
            ?
            <span
                className="item__description">
                {description}
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
