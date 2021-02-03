import * as React from "react"
import {ReplyI, SendMessageParams} from "../types";
import DialogActions from "./DialogActions";
import * as _ from "lodash"
import {findProfile, foldMessagesByAuthor} from "../helpers/chat.pu";
import Request from "../../components/request/request.pu"
import {timeAgo} from "../../components/filters/filters.pu";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {Message, VkConversationChat} from "../../../../../vk/types";
import DialogSpeeches from "./DialogSpeeches";
import ReplyMessage from "../../components/reply/ReplyMessage";
import {Description} from "../../components/item/ItemDescription";
import {ChatUserProfileI, DialogI} from "../../../../common/chat/types";
import ItemHeroV2 from "../../components/item/ItemHerV2";


export interface DialogItemProps {
    dialog      : DialogI
    profilesColl: ChatUserProfileI[]
    groupsColl: GroupProfile[]

    addDialogHistory(dialogId: number, messages: Message[], groups: GroupProfile[], users: UserProfile[]): void
}

interface DialogItemState {
    message: string
    reply  : ReplyI
}

class DialogItem extends React.Component<DialogItemProps, DialogItemState> {

    public readonly state = DialogItemCpn.initialState(this.props);

    handleMessageChange = (message: string) => {
        const {dialog} = this.props;

        localStorage.setItem(`chatDraft:${dialog.peer_id}`, message);

        this.setState(prevState => {
            return {
                ...prevState,
                message
            }
        })
    };

    onSendMessage = (peer_id ?:number) => {
        this.showOrHideReply();

        // send message
        const message = this.state.message.trim();
        const random_id = crypto.getRandomValues(new Uint32Array(1))[0]

        const params: SendMessageParams = {
            peer_id,
            random_id,
            message
        };

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


    getOwners = (dialog: DialogI): UserProfile | UserProfile[] | GroupProfile | GroupProfile[] =>{
        const {profilesColl, groupsColl} = this.props;

        if (dialog.chat_active.length > 1) {
            return dialog.chat_active.map(uid => findProfile(uid, profilesColl, groupsColl)) as GroupProfile[]
        }
        else if (dialog.chat_active.length == 1) {
            return findProfile(dialog.chat_active[0], profilesColl, groupsColl)
        }
        else if (dialog.peer_id > 2000000000) {
            return dialog.messages.map(m => findProfile(m.from_id, profilesColl, groupsColl)) as UserProfile[]
        }
        else {
            return findProfile(dialog.peer_id, profilesColl, groupsColl)
        }

    };

    static heroSmallDescription(lastMessage: Message): JSX.Element {
        const datetime = timeAgo(lastMessage.date * 1000);

        return <Description description={datetime}/>
    };

    static getTitle(dialog: DialogI) {
        const {conversation} = dialog
        if ("chat_settings" in conversation) {
            const chat = conversation as VkConversationChat
            return chat.chat_settings.title
        }
    }


    render(): React.ReactNode {
        const {dialog, profilesColl, groupsColl} = this.props;

        const foldedMessages = foldMessagesByAuthor(dialog.messages, profilesColl, groupsColl);
        const out = _.last(foldedMessages).author.isSelf;
        const lastMessage = dialog.messages.slice(-1)[0];

        const owners = this.getOwners(dialog);


        if (!owners) {
            console.debug("owners is undefined in DialogItem")
            console.debug(dialog, profilesColl, groupsColl)
        }


        return (
            <div className="item chat card-1 scrollable-card">

                <ItemHeroV2
                    description={DialogItem.heroSmallDescription(lastMessage)}
                    owners={owners}
                    dialog={dialog}
                    ownerClass="item__avatar"
                    title={DialogItem.getTitle(dialog)}
                />

                <div className="item__body clearfix">
                    <DialogSpeeches
                        speeches={foldedMessages}
                        owners={owners}
                        profilesColl={profilesColl}
                        groupsColl={groupsColl}
                        showReply={this.showOrHideReply}
                    />

                    <DialogActions
                        dialogItem={this.props}
                        foldedMessages={foldedMessages}
                        out={out}
                        showReply={this.showOrHideReply}
                    />
                </div>

                <ReplyMessage
                    reply={this.state.reply}
                    message={this.state.message}
                    sendMessage={() => this.onSendMessage(dialog.peer_id)}
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
        const message = localStorage.getItem(`chatDraft:${dialog.peer_id}`) || "";

        return {
            message,
            reply   : DialogItemCpn.reply
        }
    };
}