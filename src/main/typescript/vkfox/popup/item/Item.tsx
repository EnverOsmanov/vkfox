import * as React from "react"
import {CSSProperties} from "react"
import {addVKBase, profile2Name} from "../filters/filters.pu";
import {GroupProfile, ProfileI, UserProfile} from "../../back/users/types";
import {profilePhotoPath} from "./item.pu";

interface ItemProps {
    owners      : UserProfile | UserProfile[] | GroupProfile | GroupProfile[],
    itemClass  ?: string
    description?: string
    title      ?: string

}


class Item extends React.Component<ItemProps> {

    heroIcon = () => {
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

    heroName = () => {
        const {owners, title} = this.props;

        return Array.isArray(owners)
            ? title
            : profile2Name(owners)
    };


    isOnlineClassName = () => {
        const {owners} = this.props;

        return ("online" in owners) && (owners as UserProfile).online
            ? "is-online"
            : "";
    };

    heroSmallDescription = () => {
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
                    {this.heroIcon()}
                    <span className={`item__title ${this.isOnlineClassName()}`}>
                        <span className="item__author">
                            {this.heroName()}
                        </span>

                        {this.heroSmallDescription()}
                    </span>
                </div>

                {this.props.children}
            </div>
        )
    }
}

export default Item
