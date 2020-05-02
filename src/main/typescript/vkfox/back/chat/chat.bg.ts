"use strict";
import RequestBg from '../request/request.bg'
import * as _ from "underscore"
import Mediator from "../../mediator/mediator.bg"
import Users from "../users/users.bg"
import Router from "../router/router.bg"
import Browser from "../browser/browser.bg"
import I18N from "../../common/i18n/i18n"
import VKfoxNotifications from "../notifications/notifications.bg"
import PersistentModel from "../../common/persistent-model/persistent-model"
import {Msg} from "../../mediator/messages"
import {NotifType} from "../notifications/VKNotification";
import {LPMessage} from "../longpoll/types";
import {AuthModelI} from "../auth/types";
import {GroupProfile, UserProfile} from "../../common/users/types";
import {
    GenericRS,
    Message,
    MessagesGetByIdResponse, MessagesGetConversationsResponse,
    MessagesGetDialogsResponse,
    MessagesGetHistoryResponse, VkConversation, VkConversationCnt,
    VkDialog
} from "../../../vk/types";
import {DialogI} from "../../ui/popup/chat/types";
import {html2text} from "../../rectify/helpers";
import {DialogIUtils} from "./collections/DialogColl";
import {ChatUserProfileI} from "../../common/chat/types";
import {GProfileCollCmpn} from "../../common/profiles-collection/profiles-collection.bg";


const MAX_HISTORY_COUNT = 10;
const dialogColl: DialogI[] = [];
let persistentModel: PersistentModel,
    userId: number;

const profilesColl: Map<number, ChatUserProfileI> = new Map();
const groupsColl: Map<number, GroupProfile> = new Map();

/**
 * Notifies about current state of module.
 * Has a tiny debounce to make only one publish per event loop
 */
const publishData = _.debounce( () => {

    Mediator.pub(Msg.ChatData, {
        dialogs: dialogColl,
        profiles: [...profilesColl.values()],
        groups: [...groupsColl.values()]
    });
}, 0);


export default async function init() {
    Mediator.sub(Msg.AuthUser, (data: AuthModelI) => {
        userId = data.userId;
        dialogColl.length = 0;
        profilesColl.clear();
    });

    GProfileCollCmpn.subscribeForLpUpdates(profilesColl);

    const dialogs = await getDialogs();

    const dialogsWithUnreadMessages = await getUnreadMessages(dialogs);

    dialogColl.splice(0, dialogsWithUnreadMessages.length, ...dialogsWithUnreadMessages);

    const readyPromise = fetchProfiles(dialogColl);

    initialize(readyPromise);
}


//functions
/**
 * Updates "latestMessageId" with current last message
 * Should be called on every incoming message
 */
function updateLatestMessageId(): void {

    if (dialogColl.length) {
        const messages = dialogColl[0].messages;
        const latestMessageId = messages[messages.length - 1].id;

        persistentModel.set("latestMessageId", latestMessageId);
    }
}

async function fetchProfiles(dialogs: DialogI[]): Promise<void> {

    function dialog2Uuids(accUids: number[], dialog: DialogI): number[] {
        const uids = dialog.messages.map( message => message.from_id);

        if (dialog.chat_active) return uids.concat(dialog.chat_active);
        else return uids;
    }

    const requiredUids = dialogs.reduce(dialog2Uuids, [userId]);
    const cachesUids = [...profilesColl.keys()];
    const missingUids = _
        .chain(requiredUids)
        .uniq()
        .difference(cachesUids)
        .filter(e => 0 < e)
        .value();

    const missingGids = _
        .chain(requiredUids)
        .uniq()
        .difference(cachesUids)
        .filter(e => e < 0)
        .value();

    cachesUids
        .filter(id => !requiredUids.includes(id))
        .forEach( id => profilesColl.delete(id));

    await Promise.all([addUsers(missingUids), addGroups(missingGids)])

    publishData();
}

function addUsers(missingUids: number[]) {
    function addProfile(users: UserProfile[]) {
        function toChatProfile(user: UserProfile): ChatUserProfileI {
            const isSelf = user.id == userId;

            return {
                ...user,
                isSelf
            }
        }

        users
            .map(toChatProfile)
            .forEach(e => profilesColl.set(e.id, e));
    }

    if (missingUids.length) {
        return Users.getProfilesById(missingUids).then(addProfile);
    }
    else return Promise.resolve();
}

async function addGroups(missingGids: number[]): Promise<void> {
    function addProfile(users: GroupProfile[]) {
        console.debug(users)
        users
            .forEach(e => groupsColl.set(-e.id, e));
    }

    if (missingGids.length) {
        const absIds = missingGids.map(e => Math.abs(e))
        console.debug(missingGids)
        return Groups.getGroupById(absIds).then(addProfile);
    }
    else return Promise.resolve();
}

class Groups {
    static getGroupById(missingIds: number[]): Promise<GroupProfile[]> {
        const code = `return API.groups.getById({group_ids: '${missingIds.join()}'})`

        return RequestBg.api<GroupProfile[]>({code})
    }
}

/**
 * Initialize all internal state
 */
function initialize(readyPromise: Promise<void>) {

    Mediator.sub(Msg.ChatDataGet, () => {
        readyPromise.then(publishData)
    } );

    Mediator.sub(Msg.LongpollUpdates, onUpdates);

    persistentModel = new PersistentModel({}, {
        name: `chat:background:${userId}`
    });

    persistentModel.on("change:latestMessageId", onLatestMessageIdChange);


    readyPromise.then( () => {
        updateLatestMessageId();
        publishData();
    }).catch(console.error);
}

/**
 * Removes read messages from dialog,
 * leaves only first one or unread in sequence
 *
 * @param {DialogI} dialog subject for mutation
 */
function removeReadMessages(dialog: DialogI): DialogI {
    const {messages} = dialog;
    const lastMessage = messages.pop();
    const result = [lastMessage];
    const originalOut = lastMessage.out;

    messages.reverse().some( (message) => {
        if (message.out === originalOut && message.read_state === 0) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });
    dialog.messages = result;

    return dialog;
}

function dropReadMessages(messages: Message[]): Message[] {
    const lastMessage = messages.pop();
    const result = [lastMessage];
    const originalOut = lastMessage.out;

    messages.reverse().some(function (message) {
        if (message.out === originalOut && message.read_state === 0) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });

    return result;
}

function getDialogs(): Promise<DialogI[]> {
    const code = "return API.messages.getConversations({preview_length: 0});";

    function handleRequest(response: MessagesGetConversationsResponse): DialogI[] {

       function toDialog(messageCnt: VkConversationCnt): DialogI {
           const message = messageCnt.last_message;

           const id = messageCnt.conversation.peer.id

           return {
               id,
               chat_id     : message.chat_id,
               chat_active : message.chat_active,
               //uid         : ,
               messages    : [message]
           };
       }



        if (response && response.count) {
            return response
                .items
                .map(toDialog)
        }
        else return []
    }

    return RequestBg
        .api<MessagesGetConversationsResponse>({ code })
        .then(handleRequest);
}

function onUpdates(updates: LPMessage[]) {

    updates.forEach( (update: LPMessage) => {

        // @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server
        switch (update[0]) {
/*            case 2: {
                // {"ts":1681860311,"updates":[[2,32893,128,14100889]]}
                const messageId = update[1];
                const mask = update[2];

                if (mask == 128) {
                    dialogColl.some( dialog => {
                        dialog.messages.map( message => {
                            if (message.id === messageId) {
                                message.read_state
                            }
                        });
                    })
                }

                break;
            }*/
            // reset message flags (FLAGS&=~$mask)
            case 3:
                const messageId = update[1];
                const mask = update[2];
                const readState = mask & 1;
                if (messageId && mask && readState) {
                    dialogColl.some( (dialog: DialogI) => {
                        return dialog.messages.some( (message) => {
                            if (message.id === messageId) {
                                message.read_state = readState;
                                removeReadMessages(dialog);
                                if (readState) {
                                    Mediator.pub(Msg.ChatMessageRead, message);
                                }
                                notifyAboutChange();
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
async function getUnreadMessages(dialogs: DialogI[]): Promise<DialogI[]> {
    function getHistory(dialog: DialogI): Promise<MessagesGetHistoryResponse> {
        if (!dialog.id) {
            debugger
            console.debug("getUnreadMessages", dialog)
        }
        const code = "return API.messages.getHistory({" +
            `peer_id: ${dialog.id},` +
            `count: ${MAX_HISTORY_COUNT} ` +
            "});";

        return RequestBg.api({ code });
    }

    function getUnreadMessagesForDialog(dialog: DialogI) {
        const isUnread = !dialog.chat_id && !dialog.messages[0].read_state;

        if (isUnread) {
            return getHistory(dialog).then( historyMessages => {
                if (historyMessages && historyMessages.items[0]) {
                    const rawHistoryMessages = historyMessages.items.reverse();

                    dialog.messages = dropReadMessages(rawHistoryMessages);
                    return dialog;
                }
                else return dialog;
            })
        }
        else return Promise.resolve(dialog);
    }

    const dialogsWithUnreadMessages = dialogs.map(getUnreadMessagesForDialog);

    return Promise.all(dialogsWithUnreadMessages);
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
    if (_.isEmpty(attachment)) {
        // mimic response from server
        const message: Message = {
            text      : update[6],
            title     : update[5],
            date      : update[4],
            from_id   : dialogCompanionUid,
            peer_id   : dialogCompanionUid,
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
        const code = `return API.messages.getById({chat_active: 1, message_ids: [${messageId}]});`;
        messageDeferred = RequestBg.api<MessagesGetByIdResponse>({ code });
    }

    async function handleMessage(response: GenericRS<Message>): Promise<Message> {

        const message: Message = response.items[0];
        const dialogId = message.peer_id;

        const dialog = dialogColl.find(e => e.id == dialogId);
        if (dialog) {
            dialog.messages.push(message);
            removeReadMessages(dialog);
        }
        else {
            const firstMessage: DialogI = {
                id          : message.peer_id,
                chat_id     : message.chat_id,
                chat_active : message.chat_active,
                messages    : [message]
            };

            dialogColl.push(firstMessage);
        }

        await fetchProfiles(dialogColl);
        // important to trigger change, when profiles are available
        // because will cause an error, when creating notifications
        notifyAboutChange();
        return message;
    }

    function handleResponse(response: MessagesGetByIdResponse): Promise<Message> {
        return response
            ? handleMessage(response as GenericRS<Message>)
            : Promise.reject(new Error("VK response sucks, maybe I used incorrect parameters :("))
    }

    return messageDeferred
        .then(handleResponse)
        .catch(e => console.error(`Error during AddNewMessage`, e));
}


function notifyAboutChange() {
    dialogColl.sort(DialogIUtils.comparator);
    updateLatestMessageId();
    publishData();
}


function onLatestMessageIdChange() {
    function notifyAboutMessage(): void {

        const profile: UserProfile = profilesColl.get(lastMessage.peer_id);
        const chatActive = Browser.isPopupOpened() && Router.isChatTabActive();

        const gender = profile.sex === 1 ? "female" : "male";
        const name = Users.getName(profile);

        const title = I18N.get("sent a message", {
            NAME: name,
            GENDER: gender
        });

        const sanitizedMessage = html2text(lastMessage.text);

        const image = profile.photo || profile.photo_50 || profile.photo_100 || profile.photo_200;

        VKfoxNotifications.notify({
            title,
            type   : NotifType.CHAT,
            message: sanitizedMessage,
            image,
            noBadge: chatActive,
            noPopup: chatActive,
            sex    : profile.sex
        });
    }

    const messages = dialogColl[0].messages;
    const lastMessage = messages[messages.length - 1];

    // don't notify on first run,
    // when there is no previous value
    if (!this._previousAttributes.hasOwnProperty("latestMessageId")) {
        return;
    }

    if (!lastMessage.out) {
        function notifyIfVkIsNotActive(active: boolean): Promise<void> {
            return active
                ? Promise.resolve()
                : fetchProfiles(dialogColl).then(notifyAboutMessage)
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
