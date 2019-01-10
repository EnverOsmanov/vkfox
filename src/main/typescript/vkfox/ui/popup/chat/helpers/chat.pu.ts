"use strict";
import Request from "../../components/request/request.pu";
import Users from "../../components/users/users.pu";
import {Collection} from "backbone"
import {PuChatUserProfile} from "../../../../back/chat/collections/ProfilesColl"
import {GetHistoryParams} from "../../../../common/chat/types";
import {DialogI, MessageHistoryI, Speech} from "../types";
import {UserProfile} from "../../../../back/users/types";
import {Message, MessagesGetHistoryResponse} from "../../../../../vk/types";

function getProfiles(dialog: DialogI, messages: Message[]): Promise<UserProfile[]> {

    if (dialog.chat_active) {
        //after fetching of news profiles,
        //we must make sure that we have
        //required profile objects
        const userIds = messages
            .map(message => message.user_id);

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
    else params.user_id = dialog.uid;

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
export function foldMessagesByAuthor(messages: Message[], profilesColl: Collection<PuChatUserProfile>) {
    const selfProfile: UserProfile = profilesColl.findWhere({isSelf: true}).toJSON();

    function messageReducer(speeches: Speech[], message: Message): Speech[] {
        const lastItem = speeches[speeches.length - 1];

        function getProfile(): UserProfile {

            return profilesColl.get(message.user_id)
                .toJSON()
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


