"use strict";
import Request from "../request/request.pu";
import * as _ from "underscore";
import Users from "../users/users.pu";
import * as Backbone from "backbone"
import {Profile, ProfileI} from "./collections/ProfilesColl"
import {DialogI, GetHistoryParams, Message, MessageHistoryI, MessageMemo} from "./collections/DialogColl";


export function getHistory(dialog: DialogI, offset: number): Promise<MessageHistoryI> {
    const params: GetHistoryParams = {
        offset,
        count: 5
    };

    if (dialog.chat_active) params.chat_id = dialog.chat_id;
    else params.user_id = dialog.uid;

    const code = `return  API.messages.getHistory(${ JSON.stringify(params) });`;

    function handleResponse(messages: Message[]) {
        if (dialog.chat_active) {
            //after fetching of news profiles,
            //we must make sure that we have
            //required profile objects
            const userIds = messages
                .slice(1)
                .map(message => message.uid);

            return Users.getProfilesById( userIds )
                .then(profiles => ({messages, profiles}));
        }
        else return Promise.resolve({ messages, profiles: []});
    }

    return Request.api({ code })
        .then(handleResponse);
}

/**
 * Fold adjoint messages with a common author into a group
 * and return all such groups
 *
 *
 * @returns {Array}
 */
export function foldMessagesByAuthor(messages: Message[], profilesColl: Backbone.Collection<Profile>) {
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


