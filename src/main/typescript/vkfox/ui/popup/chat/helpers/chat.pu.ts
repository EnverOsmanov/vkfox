"use strict";
import Request from "../../components/request/request.pu";
import Users from "../../components/users/users.pu";
import Groups from "../../components/groups/groups.pu";
import {ChatUserProfileI, DialogI, GetHistoryParams} from "../../../../common/chat/types";
import {MessageHistoryI, Speech} from "../types";
import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {Message, MessagesGetHistoryResponse, MessageWithAction} from "../../../../../vk/types";
import {DialogItemProps} from "../dialog/DialogItem";

function getProfiles(dialogItem: DialogItemProps, messages: Message[]): Promise<[ UserProfile[], GroupProfile[]]> {
    const {dialog, profilesColl, groupsColl} = dialogItem
    if (dialog.chat_active) {
        //after fetching of news profiles,
        //we must make sure that we have
        //required profile objects
        const messageIds = messages.map(m => m.from_id);
        const fwdIds = messages.flatMap(m => m.fwd_messages.map(f => f.from_id))
        const replyIds = messages.flatMap(m => m.reply_message? [m.reply_message.from_id] : [] )
        const actionIds = messages.flatMap(m => ("action" in m)? [(m as MessageWithAction).action.member_id] : [] )
        const ids = messageIds.concat(fwdIds, replyIds, actionIds)

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
export function markAsRead(dialog: DialogI): Promise<any> {
    const {peer_id} = dialog;

    const method = "dialog.markAsRead";
    const params = {
        peer_id
    };

    return Request.directApi(method, params);
}


