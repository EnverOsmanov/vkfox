import * as React from "react"
import ChatPage from "../ChatPage";
import ItemAction from "../../components/itemActions/ItemAction";
import I18N from "../../../../common/i18n/i18n";
import ItemActions from "../../components/itemActions/ItemActions";

import {getHistory, markAsRead} from "../helpers/chat.pu";
import * as _ from "underscore"
import {DialogI, MessageHistoryI, Speech} from "../types";
import {UserProfile} from "../../../../common/users/types";
import {Message} from "../../../../../vk/types";
import BrowserPu from "../../../../browser/browser.pu";

interface DialogActionsProps {
    dialog  : DialogI
    out     : boolean
    foldedMessages: Speech[]

    showReply(): void
    addToProfilesColl(profiles: UserProfile[]): void
    addToMessages(dialogId: string, messages: Message[]): void
}

class DialogActions extends React.Component<DialogActionsProps> {

    showHistory = (dialog: DialogI) => {

        const handleHistory = (history: MessageHistoryI) => {

            const {messages, profiles} = history;

            this.props.addToProfilesColl(profiles);

            if (messages.length > 0) {
                const newMessages = dialog.messages.slice();
                newMessages.unshift(...messages.reverse());
                this.props.addToMessages(dialog.id, newMessages)
            }
        };

        return getHistory(dialog)
            .then(handleHistory)
    };

    unreadHandler = (event: React.MouseEvent<any>) => {

        if (!this.props.out) {
            markAsRead(this.props.dialog.messages);
        }
    };

    markAsRead = (unread: boolean) => {
        return unread
            ? (
                <ItemAction
                    className="chat__item-action_mark-read fa fa-bookmark"
                    title={ChatPage.markAsReadTitle(this.props.out)}
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
                    onClick={ _ => BrowserPu.createTab(messageURL)}
                />

                <ItemAction
                    className="fa fa-envelope"
                    title={I18N.get("Private message")}
                    onClick={_ => this.props.showReply()}
                />

                {this.markAsRead(unread)}

            </ItemActions>
        )
    }
}

export default DialogActions;