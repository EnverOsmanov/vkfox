import * as React from "react"
import {CSSProperties} from "react"
import {GroupProfile, ProfileI, UserProfile} from "../../../../common/users/types";
import {profilePhotoPath} from "./item.pu";
import BrowserPu from "../../../../browser/browser.pu";
import {buildVkLink, profile2Name} from "../filters/filters.pu";
import {VkConversationChat} from "../../../../../vk/types";
import {DialogI} from "../../../../common/chat/types";

interface ItemHeroV2Props {
    owners      : UserProfile | UserProfile[] | GroupProfile | GroupProfile[],
    dialog      : DialogI,
    ownerClass  : string
    description?: JSX.Element
    title      ?: string
}
class ItemHeroV2 extends React.Component<ItemHeroV2Props> {

    heroIcon = () => {
        const {owners, ownerClass, dialog} = this.props;

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
                    onClick={_ => BrowserPu.createTab(buildVkLink(anchor))}
                    className={ownerClass}>
                </div>
            );
        };


        if (dialog.conversation.peer.type == "chat") {
            const chat = dialog.conversation as VkConversationChat

            if ("photo" in chat.chat_settings) {
                const photo = chat.chat_settings.photo.photo_50

                const cssProps: CSSProperties = {
                    backgroundImage: `url(${photo})`
                };

                return (
                    <div
                        style={cssProps}
                        className={ownerClass}>
                    </div>
                )
            }
            else if (Array.isArray(owners)) {
                    return divForArray
            }
            else console.warn("Chat has no photo and not owners not an array0", dialog)
        }
        else return divForNotArray()
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

export default ItemHeroV2;