import * as React from "react"
import {SendMessageParams} from "../../../chat/collections/DialogColl";
import Item from "../../item/Item";
import DialogActions from "./DialogActions";
import * as _ from "underscore"
import {foldMessagesByAuthor} from "../helpers/chat.pu";
import Request from "../../../request/request.pu"
import {timeAgo} from "../../filters/filters.pu";
import {PuChatUserProfile} from "../../../chat/collections/ProfilesColl";
import {Collection} from "backbone";
import {DialogI, ReplyI} from "../types";
import {UserProfile} from "../../../back/users/types";
import {Message} from "../../../../vk/types";
import DialogSpeeches from "./DialogSpeeches";
import ReplyMessage from "../../reply/ReplyMessage";
import {Description} from "../../item/ItemDescription";

interface DialogItemProps {
    dialog      : DialogI
    profilesColl: Collection<PuChatUserProfile>

    addToProfilesColl(profiles: UserProfile[]): void
    addToMessages(dialogId: string, messages: Message[]): void
}

interface DialogItemState {
    message: string
    reply  : ReplyI
}

class DialogItem extends React.Component<DialogItemProps, DialogItemState> {

    public readonly state = DialogItemCpn.initialState;

    handleMessageChange = (message: string) => {
        this.setState(prevState => {
            return {
                ...prevState,
                message
            }
        })
    };

    onSendMessage = (chatId ?:number, uid?: number) => {
        this.showOrHideReply();

        // send message
        const message = this.state.message.trim();

        const params: SendMessageParams = { message };

        if (chatId) params.chat_id = chatId;
        else params.user_id = uid;

        const method = "messages.send";

        Request
            .directApi(method, params)
            .then(() => this.handleMessageChange(""))
            .catch(console.error);

        // mark messages if not from chat
        if (params.user_id) {
            const code =
                'return API.messages.markAsRead({message_ids: API.messages.getHistory({user_id:'
                + params.user_id + '})@.mid});';

            Request
                .api({code})
                .catch(console.error);
        }
    };

    showOrHideReply = () => {
        this.setState(prevState => {
            const visible = !this.state.reply.visible;

            const reply: ReplyI = {
                visible
            };

            return {
                ...prevState,
                reply
            }
        })
    };


    getOwners = (dialog: DialogI): UserProfile | UserProfile[] =>{
        const {profilesColl} = this.props;

        if (dialog.chat_id) {
            return dialog.chat_active.map(uid => profilesColl.get(uid).toJSON())
        }
        else {
            return profilesColl.get(dialog.uid).toJSON();
        }

    };

    heroSmallDescription = (lastMessage: Message) => {
        const datetime = timeAgo(lastMessage.date * 1000);

        return <Description description={datetime}/>
    };


    render(): React.ReactNode {
        const {dialog, profilesColl} = this.props;

        const foldedMessages = foldMessagesByAuthor(dialog.messages, profilesColl);
        const out = _(foldedMessages).last().author.isSelf;
        const lastMessage = dialog.messages.slice(-1)[0];

        const owners = this.getOwners(dialog);


        return (
            <Item
                description={this.heroSmallDescription(lastMessage)}
                owners={owners}
                ownerClass="item__avatar"
                itemClass="chat card-1 scrollable-card"
                title={lastMessage.title}>

                <div className="item__body clearfix">
                    <DialogSpeeches
                        speeches={foldedMessages}
                        owners={owners}
                        profilesColl={profilesColl}
                    />

                    <DialogActions
                        dialog={dialog}
                        foldedMessages={foldedMessages}
                        out={out}
                        showReply={this.showOrHideReply}
                        addToProfilesColl={this.props.addToProfilesColl}
                        addToMessages={this.props.addToMessages}
                    />
                </div>

                <ReplyMessage
                    reply={this.state.reply}
                    message={this.state.message}
                    sendMessage={() => this.onSendMessage(dialog.chat_id, dialog.uid)}
                    handleMessageChange={this.handleMessageChange}
                />

            </Item>
        )
    }
}

export default DialogItem

class DialogItemCpn {
    private static reply: ReplyI = {
        visible: false
    };

    static initialState = {
        message : "",
        reply   : DialogItemCpn.reply
    };
}