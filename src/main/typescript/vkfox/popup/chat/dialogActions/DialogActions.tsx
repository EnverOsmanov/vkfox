import * as React from "react"
import ChatPage from "../../../chat/Chat";
import ItemAction from "../../itemActions/ItemAction";
import I18N from "../../../i18n/i18n";
import ItemActions from "../../itemActions/ItemActions";

import {DialogI, Message, MessageHistoryI, MessageMemo} from "../../../chat/collections/DialogColl";
import {getHistory, markAsRead} from "../../../chat/chat.pu";
import {ProfileI} from "../../../chat/collections/ProfilesColl";
import * as _ from "underscore"
import * as $ from "jquery"

interface DialogActionsProps {
    dialog  : DialogI
    out     : boolean
    foldedMessages: MessageMemo[]

    chatId ?: number
    uid ?: number

    showReply(): void
    addToProfilesColl(profiles: ProfileI[]): void
    addToMessages(dialogId: string, messages: Message[]): void
}

class DialogActions extends React.Component<DialogActionsProps, undefined> {

    showHistory = (dialog: DialogI) => {

        const handleHistory = (history: MessageHistoryI) => {

            const {messages, profiles} = history;

            this.props.addToProfilesColl(profiles);

            if (messages.length > 1) {
                messages.shift();

                const newMessages = dialog.messages.slice();
                newMessages.unshift(...messages.reverse());
                this.props.addToMessages(dialog.id, newMessages)
            }
        };

        return getHistory(dialog, dialog.messages.length)
            .then(handleHistory)
    };

    unreadHandler = (event: React.MouseEvent<any>) => {
        if (this.props.out)
            $(event.currentTarget).data('tooltip').toggle();
        else {
            markAsRead(this.props.dialog.messages);
            $(event.currentTarget).data('tooltip').hide();
        }
    };

    markAsRead = (unread: boolean) => {
        return unread
            ? (
                <ItemAction
                    className="chat__item-action_mark-read fa fa-bookmark"
                    title={ChatPage.markAsReadTitle(this.props.out)}
                    hidden={unread}
                    onClick={this.unreadHandler}
                />
            )
            : null
    };

    render(): React.ReactNode {
        const {dialog} = this.props;
        const messageURL = `http://vk.com/im?sel=${(dialog.chat_id ? 'c' + dialog.chat_id:dialog.uid)}`;

        const unread = _(dialog.messages).last().read_state === 0;


        return (
            <ItemActions>

                <ItemAction
                    className="fa fa-clock-o"
                    onClick={() => this.showHistory(dialog)}
                    title={I18N.get("Show history")}
                />

                <ItemAction
                    className="fa fa-external-link-square"
                    title={I18N.get("Open in New Tab")}
                    anchor={messageURL}
                />

                <ItemAction
                    className="fa fa-envelope"
                    title={I18N.get("Private message")}
                    onClick={e => this.props.showReply()}
                />

                {this.markAsRead(unread)}

            </ItemActions>
        )
    }
}

export default DialogActions;