import * as React from "react"
import {DialogI, ReplyI, SendMessageParams} from "../types";
import DialogActions from "./DialogActions";
import * as _ from "underscore"
import {foldMessagesByAuthor} from "../helpers/chat.pu";
import Request from "../../components/request/request.pu"
import {timeAgo} from "../../components/filters/filters.pu";
import {UserProfile} from "../../../../common/users/types";
import {Message} from "../../../../../vk/types";
import DialogSpeeches from "./DialogSpeeches";
import ReplyMessage from "../../components/reply/ReplyMessage";
import {Description} from "../../components/item/ItemDescription";
import ItemHero from "../../components/item/ItemHero";
import {ChatUserProfileI} from "../../../../common/chat/types";


interface DialogItemProps {
    dialog      : DialogI
    profilesColl: ChatUserProfileI[]

    addToProfilesColl(profiles: UserProfile[]): void
    addToMessages(dialogId: string, messages: Message[]): void
}

interface DialogItemState {
    message: string
    reply  : ReplyI
}

class DialogItem extends React.Component<DialogItemProps, DialogItemState> {

    public readonly state = DialogItemCpn.initialState(this.props);

    handleMessageChange = (message: string) => {
        const {dialog} = this.props;

        localStorage.setItem(`chatDraft:${dialog.id}`, message);

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
            .directApi<void>(method, params)
            .then(() => this.handleMessageChange(""))
            .catch(console.error);
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
            return dialog.chat_active.map(uid => profilesColl.find(e => e.id == uid))
        }
        else {
            return profilesColl.find(e => e.id == dialog.uid);
        }

    };

    static heroSmallDescription(lastMessage: Message): JSX.Element {
        const datetime = timeAgo(lastMessage.date * 1000);

        return <Description description={datetime}/>
    };


    render(): React.ReactNode {
        const {dialog, profilesColl} = this.props;

        const foldedMessages = foldMessagesByAuthor(dialog.messages, profilesColl);
        if (!_(foldedMessages).last().author) {
            debugger;
        }
        const out = _(foldedMessages).last().author.isSelf;
        const lastMessage = dialog.messages.slice(-1)[0];

        const owners = this.getOwners(dialog);


        return (
            <div className="item chat card-1 scrollable-card">

                <ItemHero
                    description={DialogItem.heroSmallDescription(lastMessage)}
                    owners={owners}
                    ownerClass="item__avatar"
                    title={lastMessage.title}
                />

                <div className="item__body clearfix">
                    <DialogSpeeches
                        speeches={foldedMessages}
                        owners={owners}
                        profilesColl={profilesColl}
                        showReply={this.showOrHideReply}
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

            </div>
        )
    }
}

export default DialogItem

class DialogItemCpn {
    private static reply: ReplyI = {
        visible: false
    };

    static initialState(props: DialogItemProps) {
        const {dialog} = props;
        const message = localStorage.getItem(`chatDraft:${dialog.id}`) || "";

        return {
            message,
            reply   : DialogItemCpn.reply
        }
    };
}