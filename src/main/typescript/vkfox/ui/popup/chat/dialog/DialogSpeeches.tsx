import * as React from "react"
import {CSSProperties} from "react"
import {buildVkLink, profile2Name} from "../../components/filters/filters.pu";
import {Speech} from "../types";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {Message, MessageWithAction} from "../../../../../vk/types";
import RectifyPu from "../../../../rectify/RectifyPu";
import I18N from "../../../../common/i18n/i18n";
import {profilePhotoPath} from "../../components/item/item.pu";
import {attachmentsDivM} from "./helpers/dialog.pu";
import BrowserPu from "../../../../browser/browser.pu";
import {ChatUserProfileI} from "../../../../common/chat/types";


interface DialogSpeechesProps {
    speeches    : Speech[],
    owners      : UserProfile | UserProfile[]
    profilesColl: ChatUserProfileI[]
    groupsColl: GroupProfile[]
    showReply(): void
}


class DialogSpeeches extends React.Component<DialogSpeechesProps, object> {

    getActionText(messageItem: Message, speech: Speech): React.ReactNode | undefined {
        if ("action" in messageItem) {
            const messageWithAction = messageItem as MessageWithAction;

            const {profilesColl} = this.props;
            switch (messageWithAction.action.type) {
                case "chat_kick_user": {

                    const profile = profilesColl.find(e => e.id == messageWithAction.from_id);

                    if (!profile) {
                        console.warn("Profile not found in message with action", messageWithAction.from_id);
                        return undefined;
                    }

                    const rawM = speech.author.id === messageWithAction.from_id
                        ? "Chat leave user"
                        : "Chat kick user";

                    const i18nAction = I18N.getWithGender(rawM, profile.sex);

                    const targetName = profile2Name(profile);
                    const finalText = `${targetName} ${i18nAction}`;
                    return (
                        <small><i>{finalText}</i></small>
                    )
                }
                default:
                    console.warn("Unknown message action", messageWithAction.action);
                    return undefined;
            }
        }
        else return undefined;
    };

    forwardedMessages(messageItem: Message) {
        const {profilesColl} = this.props;

        if (messageItem.fwd_messages) {
            return messageItem.fwd_messages.map( (fwdMessage, i) => {

                function divForNotArray() {
                    const prevFwdMsg = messageItem.fwd_messages[i-1];
                    if (prevFwdMsg && fwdMessage.peer_id === prevFwdMsg.peer_id) {
                        return undefined;
                    }

                    const profileO = profilesColl.find(e => e.id == fwdMessage.peer_id);

                    if (!profileO) {
                        console.warn("Profile not found in forwarded message", fwdMessage.peer_id);
                        return undefined;
                    }

                    const owner = profileO as GroupProfile | UserProfile;
                    const photo = profilePhotoPath(owner);

                    const anchor = "type" in owner
                        ? `/club${owner.id}`
                        : `/id${owner.id}`;

                    const cssProps: CSSProperties = {
                        backgroundImage: `url(${photo})`
                    };

                    return (
                        <div className="item__title">
                        <div
                            style={cssProps}
                            onClick={_ => BrowserPu.createTab(buildVkLink(anchor))}
                            className="item__img media-object float-left"
                        />

                            <span className="item__author">{profile2Name(owner)}</span>
                        </div>
                    );
                }

                return (
                    <div key={i} className="chat__fwd">
                        {divForNotArray()}
                        <RectifyPu
                            text={fwdMessage.text}
                            hasEmoji={false}
                        />

                        {fwdMessage.attachments && attachmentsDivM(fwdMessage.attachments)}
                    </div>
                )
            })
        }
        else return []
    };




    singleMessageDiv = (messageItem: Message, speech: Speech) => {

        const userJoinedOrKickedInfo = this.getActionText(messageItem, speech);
        if (messageItem.text != "" && !messageItem.text) {
            console.warn("Message is missing", messageItem)
        }

        return (
            <div key={messageItem.id}>
                <RectifyPu text={messageItem.text} hasEmoji={false}/>

                {this.forwardedMessages(messageItem)}

                {userJoinedOrKickedInfo}

                <br hidden={!(messageItem.attachments && messageItem.text)}/>

                {messageItem.attachments && attachmentsDivM(messageItem.attachments)}
            </div>
        )
    };


    messages = (speech: Speech) => speech.items.map(messageItem => this.singleMessageDiv(messageItem, speech));


    render(): React.ReactNode {

        const {speeches, owners} = this.props;

        return speeches.map((speech, i, array) => {

                const isOutClassName = speech.out
                    ? "chat__messages_out"
                    : "chat__messages_in";

                const messageAuthor = speech.author.id !== (owners as UserProfile).id
                    ?
                    <small className="chat__author">
                        {profile2Name(speech.author)}
                    </small>
                    : null;


                const onSpeechClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    const isButton = (event.target as HTMLElement).classList.contains("btn");

                    if (!isButton && !getSelection().toString() && array.length === i + 1) {
                        this.props.showReply();
                    }
                };

                return (
                    <blockquote
                        key={i}
                        onClick={onSpeechClick}
                        className="chat__item-content">

                        <div className={isOutClassName}>
                            {this.messages(speech)}

                            {messageAuthor}
                        </div>

                    </blockquote>
                )
            }
        )
    }
}

export default DialogSpeeches