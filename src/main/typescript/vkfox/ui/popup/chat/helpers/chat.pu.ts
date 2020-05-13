"use strict";
import Request from "../../components/request/request.pu";
import Users from "../../components/users/users.pu";
import Groups from "../../components/groups/groups.pu";
import {ChatUserProfileI, DialogI, GetHistoryParams} from "../../../../common/chat/types";
import {MessageHistoryI, Speech} from "../types";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {Message, MessagesGetHistoryResponse} from "../../../../../vk/types";
import {DialogItemProps} from "../dialog/DialogItem";
import {extractIdsFromMessage} from "../../../../common/chat/chat";
import ProxyMethods from "../../../../proxy-methods/proxy-methods.pu";
import {ProxyNames} from "../../../../mediator/messages";

function getProfiles(dialogItem: DialogItemProps, messages: Message[]): Promise<[ UserProfile[], GroupProfile[]]> {
    const {dialog, profilesColl, groupsColl} = dialogItem
    if (dialog.chat_active) {
        //after fetching of news profiles,
        //we must make sure that we have
        //required profile objects
        const ids = messages.flatMap(extractIdsFromMessage)

        const unique = [...new Set(ids)];

        return Promise.all([
            getUsers(unique, profilesColl),
            getGroups(unique, groupsColl)
        ])

    } else return Promise.resolve([[], []]);
}

function getUsers(unique: number[], users: UserProfile[]): Promise<UserProfile[]> {
    const cachedIds = users.map(u => u.id)

    const ids = unique
        .filter(id => 0 < id)
        .filter(id => !cachedIds.includes(id))

    return ids.length ?
        Users.getProfilesById(ids)
        : Promise.resolve([]);
}

function getGroups(unique: number[], profiles: GroupProfile[]): Promise<GroupProfile[]> {
    const cachedIds = profiles.map(p => p.id)

    const ids = unique
        .filter(id => id < 0)
        .filter(id => !cachedIds.includes(id))
        .map(id => Math.abs(id))

    return ids.length
        ? Groups.getProfilesById(ids)
        : Promise.resolve([]);
}

function buildParams(dialog: DialogI): GetHistoryParams {
    return {
        peer_id: dialog.conversation.peer.id,
        offset : dialog.messages.length,
        count  : 5
    };
}

export async function getHistory(dialogItem: DialogItemProps): Promise<MessageHistoryI> {
    const {dialog} = dialogItem

    const params = buildParams(dialog);

    const method = "messages.getHistory";

    const historyR = await Request.directApi<MessagesGetHistoryResponse>(method, params);

    const messages = historyR.items;

    const [profiles, groups] = await getProfiles(dialogItem, messages);

    return {messages, profiles, groups}
}

export function findProfile(id: number, profilesColl: ChatUserProfileI[], groupsColl: GroupProfile[]): UserProfile | GroupProfile {
    const profiles: Array<UserProfile | GroupProfile> = id > 0
        ? profilesColl
        : groupsColl

    return profiles.find(e => e.id == Math.abs(id));
}

/**
 * Fold adjoint messages with a common author into a group
 * and return all such groups
 *
 *
 * @returns {Array}
 */
export function foldMessagesByAuthor(messages: Message[], profilesColl: ChatUserProfileI[], groupsColl: GroupProfile[]): Speech[] {
    const selfProfile: UserProfile = profilesColl.find(e => e.isSelf);

    function messageReducer(speeches: Speech[], message: Message): Speech[] {
        const lastItem = speeches[speeches.length - 1];

        function getProfile(): UserProfile {
            const found = findProfile(message.from_id, profilesColl, groupsColl);
            if (!found) {
                throw new Error(`User (${message.from_id}) not found for message ${message.id}`)
            }

            return found as UserProfile
        }

        const author: UserProfile = message.out
            ? selfProfile
            : getProfile();

        if (lastItem && (author.id === lastItem.author.id))
            lastItem.items.push(message);
        else {


            speeches.push({
                items: [message],
                out  : Boolean(message.out),
                author
            });
        }

        return speeches;
    }

    return messages.reduce(messageReducer, []);
}

/**
 * Mark dialog as read
 *
 */
export async function markAsRead(dialog: DialogI): Promise<any> {
    const {peer_id} = dialog;

    const method = "messages.markAsRead";
    const params = {
        peer_id
    };

    const status = await Request.directApi<number>(method, params);
    if (Boolean(status)) {
        const lastMessage = dialog.messages[dialog.messages.length-1];

        return markAsReadBg(peer_id, lastMessage.id)
    }
    else {
        console.debug("Response to messages.markAsRead is not 0")
        return Promise.resolve()
    }
}


function markAsReadBg(peer_id: number, messageId: number): Promise<void> {
    return ProxyMethods.forwardM(ProxyNames.ChatBg, "markAsRead", peer_id, messageId)
}

