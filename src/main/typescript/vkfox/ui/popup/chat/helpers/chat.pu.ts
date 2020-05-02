"use strict";
import Request from "../../components/request/request.pu";
import Users from "../../components/users/users.pu";
import {ChatUserProfileI, GetHistoryParams} from "../../../../common/chat/types";
import {DialogI, MessageHistoryI, Speech} from "../types";
import {GroupProfile, ProfileI, UserProfile} from "../../../../common/users/types";
import {Message, MessagesGetHistoryResponse} from "../../../../../vk/types";

function getProfiles(dialog: DialogI, messages: Message[]): Promise<UserProfile[]> {

    if (dialog.chat_active) {
        //after fetching of news profiles,
        //we must make sure that we have
        //required profile objects
        const userIds = messages
            .map(message => message.peer_id);

        return Users.getProfilesById( userIds )
    }
    else return Promise.resolve([]);
}

function buildParams(dialog: DialogI) {
    const params: GetHistoryParams = {
        offset  : dialog.messages.length,
        count   : 5
    };

    if (dialog.chat_active) params.chat_id = dialog.chat_id;
    else params.user_id = dialog.id;

    return params;
}

export async function getHistory(dialog: DialogI): Promise<MessageHistoryI> {
    const params = buildParams(dialog);

    const method = "messages.getHistory";

    const historyR = await Request.directApi<MessagesGetHistoryResponse>(method, params);

    const messages = historyR.items;

    const profiles = await getProfiles(dialog, messages);

    return {messages, profiles}
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

            const profiles: ProfileI[] = message.from_id > 0 ? profilesColl : groupsColl
            const found = profiles.find(e => e.id == Math.abs(message.from_id))
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
                items : [message],
                out   : Boolean(message.out),
                author
            });
        }

        return speeches;
    }

    return messages.reduce(messageReducer, []);
}

/**
 * Mark messages as read
 *
 * @param {Array} messages
 */
export function markAsRead(messages: Message[]): Promise<any> {
    const message_ids = messages.map(m => m.id);

    const method = "messages.markAsRead";
    const params = {
        message_ids
    };

    return Request.directApi(method, params);
}


