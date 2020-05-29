import * as React from "react"
import ChatPage from "../ChatPage";
import ItemAction from "../../components/itemActions/ItemAction";
import I18N from "../../../../common/i18n/i18n";
import ItemActions from "../../components/itemActions/ItemActions";

import {getHistory, markAsRead} from "../helpers/chat.pu";
import * as _ from "lodash"
import {MessageHistoryI, Speech} from "../types";
import BrowserPu from "../../../../browser/browser.pu";
import {DialogItemProps} from "./DialogItem";

interface DialogActionsProps {
    out: boolean
    foldedMessages: Speech[]

    showReply(): void

    dialogItem: DialogItemProps
}

class DialogActions extends React.Component<DialogActionsProps> {

    showHistory = (dialogItem: DialogItemProps) => {

        const handleHistory = (history: MessageHistoryI) => {

            const {messages, profiles, groups} = history;

            if (messages.length > 0) {
                const {dialog} = dialogItem;

                const newMessages = dialog.messages.slice();
                newMessages.unshift(...messages.reverse());

                dialogItem.addDialogHistory(dialog.peer_id, newMessages, groups, profiles)
            }
        };

        return getHistory(dialogItem)
            .then(handleHistory)
    };

    unreadHandler = (_: React.MouseEvent<any>) => {

        if (!this.props.out) {
            markAsRead(this.props.dialogItem.dialog);
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
        const {dialogItem} = this.props;
        const {dialog} = dialogItem;
        const messageURL = `http://vk.com/im?sel=${dialog.peer_id}`;

        const {conversation} = dialog

        const isRead = (_.last(dialog.messages).out == 1)
            ? conversation.last_message_id === conversation.out_read
            : conversation.last_message_id === conversation.in_read;


        return (
            <ItemActions>

                <ItemAction
                    className="fa fa-clock-o"
                    onClick={() => this.showHistory(dialogItem)}
                    title={I18N.get("Show history")}
                />

                <ItemAction
                    className="fa fa-external-link-square"
                    title={I18N.get("Open in New Tab")}
                    onClick={_ => BrowserPu.createTab(messageURL)}
                />

                <ItemAction
                    className="fa fa-envelope"
                    title={I18N.get("Private message")}
                    onClick={_ => this.props.showReply()}
                />

                {this.markAsRead(!isRead)}

            </ItemActions>
        )
    }
}

export default DialogActions;