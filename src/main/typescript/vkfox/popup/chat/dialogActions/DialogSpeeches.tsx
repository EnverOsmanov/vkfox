import * as React from "react"
import {CSSProperties} from "react"
import {addVKBase, profile2Name} from "../../filters/filters.pu";
import {Speech} from "../types";
import {GroupProfile, UserProfile} from "../../../back/users/types";
import {Message, MessageWithAction} from "../../../../vk/types";
import AttachmentC from "../../attachment/AttachmentC";
import RectifyPu from "../../../rectify/rectify.pu";
import I18N from "../../../i18n/i18n";
import {PuChatUserProfile} from "../../../chat/collections/ProfilesColl";
import {Collection} from "backbone";
import {AttachmentContainer} from "../../../../vk/types/newsfeed";
import {profilePhotoPath} from "../../item/item.pu";

interface DialogSpeechesProps {
    speeches    : Speech[],
    owners      : UserProfile | UserProfile[]
    profilesColl: Collection<PuChatUserProfile>
}


class DialogSpeeches extends React.Component<DialogSpeechesProps, object> {

    getActionText(messageItem: Message, speech: Speech): string | undefined {
        if ("action" in messageItem) {
            const messageWithAction = messageItem as MessageWithAction;

            const {profilesColl} = this.props;
            switch (messageWithAction.action) {
                case "chat_kick_user": {

                    const profileO = profilesColl.get(messageWithAction.action_mid);

                    if (!profileO) {
                        console.warn("Profile not found in message with action", messageWithAction.action_mid);
                        return undefined;
                    }
                    const profile = profileO.toJSON();

                    const rawM = speech.author.id === messageWithAction.action_mid
                        ? "Chat leave user"
                        : "Chat kick user";

                    const i18nAction = I18N.getWithGender(rawM, profile.sex);

                    const targetName = profile2Name(profile);
                    return `${targetName} ${i18nAction}`;
                }
                default:
                    console.warn("Unknown message action", messageWithAction.action);
                    return undefined;
            }
        }
        else return undefined;
    };

    forwardedMessages = (messageItem: Message) => {
        const {profilesColl} = this.props;

        if (messageItem.fwd_messages) {
            return messageItem.fwd_messages.map( (fwdMessage, i) => {

                function divForNotArray() {
                    const prevFwdMsg = messageItem.fwd_messages[i-1];
                    if (prevFwdMsg && fwdMessage.user_id === prevFwdMsg.user_id) {
                        return undefined;
                    }

                    const profileO = profilesColl.get(fwdMessage.user_id);

                    if (!profileO) {
                        console.warn("Profile not found in forwarded message", fwdMessage.user_id);
                        return undefined;
                    }

                    const owner = profileO.toJSON() as GroupProfile | UserProfile;
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
                            data-anchor={addVKBase(anchor)}
                            className="item__img media-object pull-left"
                        />

                            <span className="item__author">{profile2Name(owner)}</span>
                        </div>
                    );
                }

                return (
                    <div key={i} className="chat__fwd-message">
                        {divForNotArray()}
                        <span>{fwdMessage.body}</span>

                        {this.attachmentsDiv(fwdMessage.attachments)}
                    </div>
                )
            })
        }
        else return []
    };

    attachmentsDiv = (attachments?: AttachmentContainer[]) => {
        if (attachments) {
            return attachments.map((attachment, i) =>

                <AttachmentC
                    key={i}
                    data={attachment[attachment.type]}
                    type={attachment.type}
                />
            )
        }
        else return []
    };


    singleMessageDiv = (messageItem: Message, speech: Speech) => {

        const userJoinedOrKickedInfo = this.getActionText(messageItem, speech);

        return (
            <div key={messageItem.id}>
                <span>
                    <RectifyPu
                        text={messageItem.body}
                        hasEmoji={false}
                    />
                </span>

                {this.forwardedMessages(messageItem)}

                <small><i>{userJoinedOrKickedInfo}</i></small>

                <br hidden={!(messageItem.attachments && messageItem.body)}/>

                {this.attachmentsDiv(messageItem.attachments)}
            </div>
        )
    };


    messages = (speech: Speech) => speech.items.map(messageItem => this.singleMessageDiv(messageItem, speech));


    render(): React.ReactNode {

        const {speeches, owners} = this.props;

        return speeches.map((speech, i) => {

                const isOutClassName = speech.out
                    ? "chat__messages_out"
                    : "";

                const messageAuthor = speech.author.id !== (owners as UserProfile).id
                    ?
                    <small className="chat__author">
                        {profile2Name(speech.author)}
                    </small>
                    : null;

                return (
                    <blockquote
                        key={i}
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