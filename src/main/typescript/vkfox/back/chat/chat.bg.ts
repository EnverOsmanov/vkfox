"use strict";
import Request from '../../request/request.bg'
import * as _ from "underscore"
import Mediator from "../../mediator/mediator.bg"
import Users from "../users/users.bg"
import Router from "../router/router.bg"
import Browser from "../../browser/browser.bg"
import I18N from "../../i18n/i18n"
import Notifications from "../../notifications/notifications.bg"
import PersistentModel from "../../persistent-model/persistent-model"
import Msg from "../../mediator/messages"
import {Dialog, DialogColl} from "../../chat/collections/DialogColl";
import {NotifType} from "../../notifications/Notification";
import {LPMessage} from "../longpoll/models";
import {ChatUserProfileColl, ProfilesCmpn} from "../../profiles-collection/profiles-collection.bg";
import {AuthModelI} from "../auth/types";
import {UserProfile} from "../users/types";
import {
    VkDialog,
    MessagesGetDialogsResponse,
    MessagesGetHistoryResponse,
    Message,
    MessageHistory, MessagesGetByIdResponse
} from "../../../vk/types";
import {DialogI} from "../../popup/chat/types";

const MAX_HISTORY_COUNT = 10;

let persistentModel,
    userId: number;
const dialogColl = new DialogColl();
const profilesColl = new ChatUserProfileColl();

/**
 * Notifies about current state of module.
 * Has a tiny debounce to make only one publish per event loop
 */
const publishData = _.debounce( () => {

    Mediator.pub(Msg.ChatData, {
        dialogs: dialogColl.toJSON(),
        profiles: profilesColl.toJSON()
    });
}, 0);


export default function init() {

    const readyPromise = getDialogs()
        .then(getUnreadMessages)
        .then(fetchProfiles);

    initialize(readyPromise);
    Mediator.sub(Msg.AuthUser, (data: AuthModelI) => {
        userId = data.userId;
        dialogColl.reset();
        profilesColl.reset();
    });
}


//functions
/**
 * Updates "latestMessageId" with current last message
 * Should be called on every incoming message
 */
function updateLatestMessageId(): void {

    if (dialogColl.size()) {
        const messages = dialogColl.first().messages;
        const latestMessageId = messages[messages.length - 1].id;

        persistentModel.set("latestMessageId", latestMessageId);
    }
}

function fetchProfiles(): Promise<void> {

    function dialog2Uuids(accUids: number[], dialog: Dialog): number[] {
        const allDialogUids = dialog.messages.map( message => message.user_id);

        const uids = accUids
            .concat(allDialogUids, dialog.uid)
            .filter(uid => uid > 0);

        if (dialog.chat_active) return uids.concat(dialog.chat_active);
        else return uids;
    }

    function addProfile(data: UserProfile[]) {
        profilesColl.add(data);
        profilesColl.get(userId).isSelf = true;
    }

    const requiredUids = dialogColl.reduce(dialog2Uuids, [userId]);
    const cachesUids = profilesColl.map(p => p.id);
    const missingUids = _
        .chain(requiredUids)
        .uniq()
        .difference(cachesUids)
        .value();

    profilesColl.remove(_(cachesUids).difference(requiredUids));

    if (missingUids.length) {
        return Users.getProfilesById(missingUids).then(addProfile);
    }
    else return Promise.resolve();
}

/**
 * Initialize all internal state
 */
function initialize(readyPromise: Promise<void>) {

    Mediator.sub(Msg.ChatDataGet, () => {
        readyPromise.then(publishData)
    } );

    Mediator.sub(Msg.LongpollUpdates, onUpdates);

    // Notify about changes
    dialogColl.on("change", notifyAboutChange);
    profilesColl.on('change', publishData);


    persistentModel = new PersistentModel({}, {
        name: ['chat', 'background', userId].join(':')
    });

    persistentModel.on('change:latestMessageId', onLatestMessageIdChange);


    readyPromise.then( () => {
        updateLatestMessageId();
        publishData();
    });
}

/**
 * Removes read messages from dialog,
 * leaves only first one or unread in sequence
 *
 * @param {Dialog} dialog subject for mutation
 */
function removeReadMessages(dialog: Dialog) {
    const messages = dialog.messages,
      result       = [messages.pop()],
      originalOut  = result[0].out;

    messages.reverse().some(function (message) {
        if (message.out === originalOut && message.read_state === 0) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });
    dialog.messages = result;
}

function getDialogs(): Promise<void> {
    const code = "return API.messages.getDialogs({preview_length: 0});";

    function handleRequest(response: MessagesGetDialogsResponse): void {

       function toDialog(messageCnt: VkDialog): Dialog {
           const message = messageCnt.message;

           const id = message.chat_id
               ? 'chat_id_' + message.chat_id
               :'uid_' + message.user_id;

           const dialog: DialogI = {
               id,
               chat_id     : message.chat_id,
               chat_active : message.chat_active,
               uid         : message.user_id,
               messages    : [message]
           };

           return new Dialog(dialog);
       }



        if (response && response.count) {
            dialogColl.reset(
                response
                    .items
                    .filter( item => item.message.user_id > 0)
                    .map(toDialog)
            );
        }
    }

    return Request
        .api<MessagesGetDialogsResponse>({ code })
        .then(handleRequest);
}

function onUpdates(updates: LPMessage[]) {

    updates.forEach( (update: LPMessage) => {

        // @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server
        switch (update[0]) {
            // reset message flags (FLAGS&=~$mask)
            case 3:
                const messageId = update[1];
                const mask = update[2];
                const readState = mask & 1;
                if (messageId && mask && readState) {
                    dialogColl.some( (dialog: Dialog) => {
                        return dialog.messages.some( (message) => {
                            if (message.id === messageId) {
                                message.read_state = readState;
                                removeReadMessages(dialog);
                                if (readState) {
                                    Mediator.pub(Msg.ChatMessageRead, message);
                                }
                                dialogColl.trigger('change');
                                return true;
                            }
                        });
                    });
                }
                break;
            case 4:
                addNewMessage(update);
                break;
        }
    });
}

/**
 * If last message in dialog is unread,
 * fetch dialog history and get last unread messages in a row
 */
function getUnreadMessages(): Promise<void> {
    function getHistory(dialog: Dialog): Promise<MessagesGetHistoryResponse> {
        const code = "return API.messages.getHistory({" +
            `user_id: ${dialog.uid},` +
            `count: ${MAX_HISTORY_COUNT} ` +
            "});";

        return Request.api({ code });
    }

    // FIXME wtf models.filter?
    const unreadDialogs =
        dialogColl.models
            .filter( dialog => !dialog.chat_id && !dialog.messages[0].read_state );

    const unreadHistoryRequests = unreadDialogs.map(getHistory);

    return Promise
        .all(unreadHistoryRequests)
        .then( (args: MessagesGetHistoryResponse[]) => {
            args.forEach( (historyMessages, index) => {
                if (historyMessages && historyMessages[0]) {

                    unreadDialogs[index].messages = historyMessages.items.reverse();

                    removeReadMessages(unreadDialogs[index]);
                }
            });
        });
}


/**
 * @param {Object} update Update object from long poll
 */
function addNewMessage(update: LPMessage) {

    const messageId      = update[1],
      flags              = update[2],
      attachment         = update[7],
      dialogCompanionUid = update[3];

    let messageDeferred: Promise<MessagesGetByIdResponse>;

    // For messages from chat attachment contains "from" property
    if (_(attachment).isEmpty()) {
        // mimic response from server
        const message: Message = {
            body      : update[6],
            title     : update[5],
            date      : update[4],
            user_id   : dialogCompanionUid,
            read_state: +!(flags & 1),
            id        : messageId,
            out       : +!!(flags & 2)
        };

        const rs: MessagesGetByIdResponse = {
            count   : 1,
            items   : [message]
        };


        messageDeferred = Promise.resolve(rs);
    }
    else {
        const code = `return API.messages.getById({chat_active: 1, mid: ${messageId}});`;
        messageDeferred = Request.api<MessagesGetByIdResponse>({ code });
    }

    messageDeferred.then( (response) => {
        const message: Message = response.items[0];
        const dialogId = message.chat_id
            ? 'chat_id_' + message.chat_id
            : 'uid_' + dialogCompanionUid;

        const dialog = dialogColl.get(dialogId);
        if (dialog) {
            dialog.messages.push(message);
            removeReadMessages(dialog);
        }
        else dialogColl.add({
            id          : dialogId,
            uid         : message.user_id,
            chat_id     : message.chat_id,
            chat_active : message.chat_active,
            messages    : [message]
        }, ProfilesCmpn.beSilentOptions);

        return fetchProfiles().then( () => {
            // important to trigger change, when profiles are available
            // because will cause an error, when creating notifications
            dialogColl.trigger('change');
            return message;
        });
    }).catch(e => console.error(`Error during AddNewMessage`, e));
}


function notifyAboutChange() {
    dialogColl.sort();
    updateLatestMessageId();
    publishData();
}


function onLatestMessageIdChange() {
    function notifyAboutMessage(): void {

        const profile: UserProfile = profilesColl.get(lastMessage.user_id).toJSON();
        const chatActive = Browser.isPopupOpened() && Router.isChatTabActive();

        const gender = profile.sex === 1 ? 'female' : 'male';
        const name = Users.getName(profile);

        const title = I18N.get('sent a message', {
            NAME: name,
            GENDER: gender
        });

        Notifications.notify({
            title,
            type   : NotifType.CHAT,
            message: lastMessage.body,
            image  : profile.photo,
            noBadge: chatActive,
            noPopup: chatActive
        });
    }

    const messages = dialogColl.first().messages;
    const lastMessage = messages[messages.length - 1];

    // don't notify on first run,
    // when there is no previous value
    if (!this._previousAttributes.hasOwnProperty('latestMessageId')) {
        return;
    }

    if (!lastMessage.out) {
        function notifyIfVkIsNotActive(active: boolean): Promise<void> {
            return active
                ? Promise.resolve()
                : fetchProfiles().then(notifyAboutMessage)
        }

        // Don't notify, when active tab is vk.com
        Browser.isVKSiteActive()
            .then(notifyIfVkIsNotActive)
            .catch(handleError);
    }
}

function handleError(e: Error): void {
    console.warn("Failed to notify in chat", e)
}
