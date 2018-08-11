import * as React from "react"
import {CSSProperties} from "react"
import {addVKBase, profile2Name} from "../filters/filters.pu";
import {GroupProfile, ProfileI, UserProfile} from "../../../back/users/types";
import BrowserPu from "../../../browser/browser.pu";
import {profilePhotoPath} from "./item.pu";

interface ItemHeroProps {
    owners      : UserProfile | UserProfile[] | GroupProfile | GroupProfile[],
    ownerClass  : string
    description?: JSX.Element
    title      ?: string
}
class ItemHero extends React.Component<ItemHeroProps> {

    heroIcon = () => {
        const {owners, ownerClass} = this.props;

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
                    onClick={_ => BrowserPu.createTab(addVKBase(anchor))}
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

    render(): React.ReactNode {
        const {description} = this.props;

        return (
            <div className="item__header">
                {this.heroIcon()}
                <span className={`item__title ${this.isOnlineClassName()}`}>
                        <span className="item__author">
                            {this.heroName()}
                        </span>

                    {description}
                    </span>
            </div>
        )
    }
}

export default ItemHero;