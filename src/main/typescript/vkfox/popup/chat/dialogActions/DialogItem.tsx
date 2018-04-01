import * as React from "react"
import {DialogI, Message, MessageMemo, SendMessageParams} from "../../../chat/collections/DialogColl";
import Item from "../../../item/Item";
import DialogActions from "./DialogActions";
import * as _ from "underscore"
import {foldMessagesByAuthor} from "../../../chat/chat.pu";
import Request from "../../../request/request.pu"
import {profile2Name, timeAgo} from "../../../filters/filters.pu";
import AttachmentC from "../../../attachment/AttachmentC";
import {Profile, ProfileI} from "../../../chat/collections/ProfilesColl";
import {Collection} from "backbone";
import {ReplyI} from "../../../chat/Chat";
import RectifyPu from "../../../rectify/rectify.pu";

interface DialogItemProps {
    dialog      : DialogI
    profilesColl: Collection<Profile>

    addToProfilesColl(profiles: ProfileI[]): void
    addToMessages(dialogId: string, messages: Message[]): void
}

interface DialogItemState {
    message: string
    reply  : ReplyI
}

class DialogItem extends React.Component<DialogItemProps, DialogItemState> {

    constructor(props) {
        super(props);

        const reply: ReplyI = {
            visible: false
        };

        this.state = {
            message: "",
            reply
        };
    }

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
        else params.uid = uid;

        const code = `return API.messages.send(${ JSON.stringify(params) });`;

        Request
            .api({ code })
            .then(() => this.handleMessageChange(""));

        // mark messages if not from chat
        if (params.uid) {
            const code =
                'return API.messages.markAsRead({message_ids: API.messages.getHistory({user_id:'
                + params.uid + '})@.mid});';

            Request.api({code});
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


    getOwners = (dialog: DialogI): ProfileI | ProfileI[] =>{
        const {profilesColl} = this.props;

        if (dialog.chat_id) {
            return dialog.chat_active.map(uid => profilesColl.get(uid).toJSON())
        }
        else {
            return profilesColl.get(dialog.uid).toJSON();
        }

    };

    singleMessage = (messageItem: Message) => {

        const attachments = !messageItem.attachments
            ? ""
            : messageItem.attachments.map((attachment, i) =>

                <AttachmentC
                    key={i}
                    data={attachment[attachment.type]}
                    type={attachment.type}
                />
            );

        return (
            <div key={messageItem.mid}>
                <span>
                    <RectifyPu
                        text={messageItem.body}
                        hasEmoji={false}
                    />
                </span>

                <br hidden={!(messageItem.attachments && messageItem.body)}/>
                {attachments}
            </div>
        )
    };

    messages = (messageItems: Message[]) => messageItems.map(this.singleMessage);


    blockquotes = (foldedMessages: MessageMemo[], owners: ProfileI | ProfileI[]) => {


        return foldedMessages.map((foldedMessage, i) => {

                const isOutClassName = foldedMessage.out
                    ? "chat__messages_out"
                    : "";

                const messageAuthor = foldedMessage.author.uid !== (owners as ProfileI).uid
                    ?
                    <small className="chat__author">
                        {profile2Name(foldedMessage.author)}
                    </small>
                    : null;

                return (
                    <blockquote
                        key={i}
                        className="chat__item-content">

                        <div className={isOutClassName}>
                            {this.messages(foldedMessage.items)}

                            {messageAuthor}
                        </div>

                    </blockquote>
                )
            }
        )
    };


    render(): React.ReactNode {
        const dialog = this.props.dialog;

        const foldedMessages = foldMessagesByAuthor(dialog.messages, this.props.profilesColl);
        const out = _(foldedMessages).last().author.isSelf;
        const datetime = timeAgo(dialog.messages.slice(-1)[0].date * 1000);

        const owners = this.getOwners(dialog);


        return (
            <Item
                description={datetime}
                owners={owners}
                itemClass="chat"
                reply={this.state.reply}
                message={this.state.message}
                title={dialog.messages.slice(-1)[0].title}
                sendMessage={() => this.onSendMessage(dialog.chat_id, dialog.uid)}
                handleMessageChange={this.handleMessageChange}>

                {this.blockquotes(foldedMessages, owners)}

                <DialogActions
                    dialog={dialog}
                    foldedMessages={foldedMessages}
                    out={out}
                    showReply={this.showOrHideReply}
                    addToProfilesColl={this.props.addToProfilesColl}
                    addToMessages={this.props.addToMessages}
                />

            </Item>
        )
    }
}

export default DialogItem