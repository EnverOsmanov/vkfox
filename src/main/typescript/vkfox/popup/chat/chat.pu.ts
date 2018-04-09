"use strict";
import Request from "../../request/request.pu";
import * as _ from "underscore";
import Users from "../../users/users.pu";
import * as Backbone from "backbone"
import {PuChatUserProfile} from "../../chat/collections/ProfilesColl"
import {GetHistoryParams, Message, ProfileI} from "../../chat/types";
import {DialogI, MessageHistoryI, MessageMemo} from "./types";

function getProfiles(dialog: DialogI, messages: Message[]): Promise<ProfileI[]> {
    if (dialog.chat_active) {
        //after fetching of news profiles,
        //we must make sure that we have
        //required profile objects
        const userIds = messages
            .slice(1)
            .map(message => message.uid);

        return Users.getProfilesById( userIds )
    }
    else return Promise.resolve([]);
}

function buildParams(dialog: DialogI, offset: number) {
    const params: GetHistoryParams = {
        offset,
        count: 5
    };

    if (dialog.chat_active) params.chat_id = dialog.chat_id;
    else params.user_id = dialog.uid;

    return params;
}

export async function getHistory(dialog: DialogI, offset: number): Promise<MessageHistoryI> {
    const params = buildParams(dialog, offset);

    const code = `return  API.messages.getHistory(${ JSON.stringify(params) });`;

    const messages = await Request.api<Message[]>({ code });

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
export function foldMessagesByAuthor(messages: Message[], profilesColl: Backbone.Collection<PuChatUserProfile>) {
    const selfProfile: ProfileI = profilesColl.findWhere({isSelf: true}).toJSON();

    function messageReducer(memo: MessageMemo[], message: Message) {
        const lastItem = memo[memo.length - 1];
        const author: ProfileI = message.out
            ? selfProfile
            : profilesColl.get(message.uid).toJSON();

        if (lastItem && (author.uid === lastItem.author.uid))
            lastItem.items.push(message);
        else {
            memo.push({
                items : [message],
                out   : author === selfProfile,
                author
            });
        }

        return memo;
    }

    return messages.reduce(messageReducer, []);
}

/**
 * Mark messages as read
 *
 * @param {Array} messages
 */
export function markAsRead(messages): Promise<any> {
    const code = `return API.messages.markAsRead({mids: [${_.pluck(messages, 'mid') }]});`;

    return Request.api({code});
}


