import {Message, VkConversation} from "../../../main/typescript/vk/types";
import * as _ from "lodash"

const message3: Message = {
    "date"        : 1589563859,
    "from_id"     : 326034749,
    "id"          : 43402,
    "out"         : 0,
    "peer_id"     : 2000000044,
    "text"        : "Не туда",
    "fwd_messages": [],
    "random_id"   : 0,
    "attachments" : [],
}

const message4: Message =     {
    "date"        : 1589563861,
    "from_id"     : 326034749,
    "id"          : 43403,
    "out"         : 0,
    "peer_id"     : 2000000044,
    "text"        : "Блллл",
    "fwd_messages": [],
    "random_id"   : 0,
    "attachments" : [],
}

const messages: Message[] = [
    {
        "date"        : 1589535413,
        "from_id"     : 437313657,
        "id"          : 43400,
        "out"         : 0,
        "peer_id"     : 2000000044,
        "text"        : "",
        "fwd_messages": [],
        "random_id"   : 0,
        "attachments" : [],
    },
    {
        "date"        : 1589563845,
        "from_id"     : 326034749,
        "id"          : 43401,
        "out"         : 0,
        "peer_id"     : 2000000044,
        "text"        : "",
        "fwd_messages": [],
        "random_id"   : 0,
        "attachments" : [],
    },
    message3,
    message4
]

// @ts-ignore
const conversation: VkConversation = {
    "peer"           : {
        "id"      : 2000000044,
        "type"    : "chat",
        "local_id": 44
    },
    "last_message_id": 43403,
    "in_read"        : 43401,
    "out_read"       : 43400,
    "can_write"      : {
        "allowed": true
    },
}

function dropReadMessages(messages: Message[], conversation: VkConversation): Message[] {
    const lastMessage = _.last(messages);

    const readMessageId = lastMessage.out
        ? conversation.out_read
        : conversation.in_read

    return lastMessage.id == readMessageId
        ? [lastMessage]
        : _.takeRightWhile(messages, m => m.id != readMessageId)
}

describe("chat.bg", () => {

    it("get unread messages", () => {
        const actual = dropReadMessages(messages, conversation)

        expect(actual).toEqual([message3, message4])
    })

    it("get at least one messages", () => {
        const allRead = {...conversation, in_read: message4.id}
        const actual = dropReadMessages(messages, allRead)

        expect(actual).toEqual([message4])
    })

})