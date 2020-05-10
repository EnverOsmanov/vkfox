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
    MessagesGetByIdResponse,
    MessagesGetConversationsByIdResponse,
    MessagesGetConversationsResponse,
    MessagesGetHistoryResponse, MessageWithAction,
    VkConversation,
    VkConversationChat,
    VkConversationCnt
} from "../../../vk/types";
import {html2textBasic} from "../../rectify/helpers";
import {DialogIUtils} from "./collections/DialogColl";
import {ChatUserProfileI, DialogI} from "../../common/chat/types";
import {GProfileCollCmpn} from "../profiles-collection/profiles-collection.bg";
import Groups from "../groups/groups.bg";


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
const publishData = _.debounce(() => {

    Mediator.pub(Msg.ChatData, {
        dialogs : dialogColl,
        profiles: [...profilesColl.values()],
        groups  : [...groupsColl.values()]
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
        const {messages} = dialog
        const allDialogUids = messages.map(message => message.from_id);

        const activeUids = dialog.chat_active
            ? dialog.chat_active
            : [];

        const fwdIds = messages.flatMap(m => m.fwd_messages.map(f => f.from_id))
        const replyIds = messages.flatMap(m => m.reply_message? [m.reply_message.from_id] : [] )
        const actionIds = messages.flatMap(m => ("action" in m)? [(m as MessageWithAction).action.member_id] : [] )

        return accUids.concat(allDialogUids, activeUids, fwdIds, replyIds, actionIds);
    }

    const requiredIds = dialogs.reduce(dialog2Uuids, []);

    const cachedUids = [...profilesColl.keys()];
    const missingUids = _
        .chain(requiredIds.concat(userId))
        .uniq()
        .difference(cachedUids)
        .filter(e => 0 < e)
        .value();

    const cachesGids = [...groupsColl.keys()];
    const missingGids = _
        .chain(requiredIds)
        .uniq()
        .difference(cachesGids)
        .filter(e => e < 0)
        .value();

    cachedUids
        .filter(id => !requiredIds.includes(id))
        .forEach(id => profilesColl.delete(id));

    await Promise.all([addUsers(missingUids), addGroups(missingGids)])

    publishData();
}

function addProfiles(users: UserProfile[]) {
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

function addUsers(missingUids: number[]) {

    if (missingUids.length) {
        return Users.getProfilesById(missingUids).then(addProfiles);
    } else return Promise.resolve();
}

async function addGroups(missingGids: number[]): Promise<void> {
    function addProfile(users: GroupProfile[]) {
        users
            .forEach(e => groupsColl.set(e.id, e));
    }

    if (missingGids.length) {
        const absIds = missingGids.map(e => Math.abs(e))
        return Groups.getProfilesById(absIds).then(addProfile);
    } else return Promise.resolve();
}

/**
 * Initialize all internal state
 */
function initialize(readyPromise: Promise<void>) {

    Mediator.sub(Msg.ChatDataGet, () => {
        readyPromise.then(publishData)
    });

    Mediator.sub(Msg.LongpollUpdates, onUpdates);

    persistentModel = new PersistentModel({}, {
        name: `chat:background:${userId}`
    });

    persistentModel.on("change:latestMessageId", onLatestMessageIdChange);


    readyPromise.then(() => {
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
    const {messages, conversation} = dialog;
    const lastMessage = messages.pop();
    const result = [lastMessage];
    const originalOut = lastMessage.out;

    messages.reverse().some((message) => {
        const isRead = message.id === conversation.in_read || message.id == conversation.out_read
        if (!isRead && message.out === originalOut) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });
    dialog.messages = result;

    return dialog;
}

function dropReadMessages(messages: Message[], conversation: VkConversation): Message[] {
    const lastMessage = messages.pop();
    const result = [lastMessage];
    const originalOut = lastMessage.out;

    messages.reverse().some( message => {
        const isRead = message.id === conversation.in_read || message.id == conversation.out_read
        if (!isRead && message.out === originalOut) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });

    return result;
}

function getDialogs(): Promise<DialogI[]> {
    const obj = {
        preview_length: 0
    }
    const code = `return API.messages.getConversations(${JSON.stringify(obj)});`;

    function handleRequest(response: MessagesGetConversationsResponse): DialogI[] {

        function toDialog(messageCnt: VkConversationCnt): DialogI {
            const {last_message, conversation} = messageCnt;

            const chat_active = getActive(conversation)

            return {
                peer_id : conversation.peer.id,
                //chat_id     : last_message.chat_id,
                chat_active,
                messages: [last_message],
                conversation
            };
        }


        if (response && response.count) {
            return response
                .items
                .map(toDialog)
        } else return []
    }

    return RequestBg
        .api<MessagesGetConversationsResponse>({code})
        .then(handleRequest);
}

function getActive(conversation: VkConversation): number[] {
    switch (conversation.peer.type) {
        case "chat": {
            const chat = conversation as VkConversationChat
            return chat.chat_settings.active_ids
        }
        case "user":
        case "group": {
            return [conversation.peer.id]
        }
        default:
            return []
    }
}

function onUpdates(updates: LPMessage[]) {
    updates.forEach((update: LPMessage) => {

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
                    dialogColl.some((dialog: DialogI) => {
                        return dialog.messages.some((message) => {
                            if (message.id === messageId) {
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
        const params = {
            peer_id: dialog.peer_id,
            count: MAX_HISTORY_COUNT
        }

        const code = `return API.messages.getHistory(${JSON.stringify(params)});`;

        return RequestBg.api({code});
    }

    async function getUnreadMessagesForDialog(dialog: DialogI): Promise<DialogI> {
        const {conversation, messages} = dialog
        const lastMessageId = messages[0].id;
        const isRead = lastMessageId === conversation.out_read || lastMessageId == conversation.in_read;

        if (isRead) return Promise.resolve(dialog);
        else {
            const historyMessages = await getHistory(dialog);
            if (historyMessages && historyMessages.items[0]) {
                const rawHistoryMessages = historyMessages.items.reverse();

                dialog.messages = dropReadMessages(rawHistoryMessages, conversation);
                return dialog;
            }
            else return dialog;
        }
    }

    const dialogsWithUnreadMessages = dialogs.map(getUnreadMessagesForDialog);

    return Promise.all(dialogsWithUnreadMessages);
}


async function getMessageById(messageId: number): Promise<Message> {
    const obj = {
        chat_active: 1,
        message_ids: [messageId]
    }

    const code = `return API.messages.getById(${JSON.stringify(obj)});`;
    const response = await RequestBg.api<MessagesGetByIdResponse>({code});

    return (response as GenericRS<Message>).items[0];
}

/**
 * @param {Object} update Update object from long poll
 */
async function addNewMessage(update: LPMessage): Promise<Message | void> {
    const messageId = update[1],
        peer_id = update[3];

    const dialog = dialogColl.find(e => e.peer_id == peer_id);

    // For messages from chat attachment contains "from" property
    if (dialog) {
        const message = await getMessageById(messageId);

        dialog.messages.push(message);
        removeReadMessages(dialog);
    } else {
        const obj = {
            peer_ids: [peer_id]
        }

        const code = `return API.messages.getConversationsById(${JSON.stringify(obj)});`;
        const [response, message] = await Promise.all([
            RequestBg.api<MessagesGetConversationsByIdResponse>({code}),
            getMessageById(messageId)
        ])

        const conversation = (response as GenericRS<VkConversation>).items[0]

        const firstDialog: DialogI = {
            conversation,
            peer_id,
            chat_active: getActive(conversation),
            messages   : [message]
        };

        dialogColl.push(firstDialog);
    }

    await fetchProfiles(dialogColl);
    // important to trigger change, when profiles are available
    // because will cause an error, when creating notifications
    notifyAboutChange();
}


function notifyAboutChange() {
    dialogColl.sort(DialogIUtils.comparator);
    updateLatestMessageId();
    publishData();
}


function findProfile(
    id: number,
    profilesColl: Map<number, UserProfile>,
    groupsColl: Map<number, GroupProfile>
): UserProfile | GroupProfile {
    const profiles: Map<number, UserProfile | GroupProfile> = id > 0
        ? profilesColl
        : groupsColl

    return profiles.get(Math.abs(id));
}

function onLatestMessageIdChange() {
    function notifyAboutMessage(): void {

        const profile = findProfile(lastMessage.from_id, profilesColl, groupsColl);
        const chatActive = Browser.isPopupOpened() && Router.isChatTabActive();

        const sex = ("sex" in profile)
            ? profile.sex
            : 0

        const gender = sex === 1
            ? "female"
            : "male";
        const name = Users.getName(profile);

        const title = I18N.get("sent a message", {
            NAME  : name,
            GENDER: gender
        });

        const sanitizedMessage = html2textBasic(lastMessage.text);

        const image = profile.photo || profile.photo_50 || profile.photo_100 || profile.photo_200;

        VKfoxNotifications.notify({
            title,
            type   : NotifType.CHAT,
            message: sanitizedMessage,
            image,
            noBadge: chatActive,
            noPopup: chatActive,
            sex
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
