import {FaveUser, GroupProfile, UserProfile} from "../../vkfox/common/users/types";
import {LPMessage} from "../../vkfox/back/longpoll/types";
import {AttachmentContainer} from "./attachment";
import {media} from "./newsfeed";

export interface VideoGetUserVideosResponse {
    /**
     * Total number
     */
    count: number;
    items: {
        /**
         * Video ID
         */
        id?: number;
        /**
         * Video owner ID
         */
        owner_id?: number;
        /**
         * Video title
         */
        title?: string;
        /**
         * Video duration in seconds
         */
        duration?: number;
        /**
         * Video description
         */
        description?: string;
        /**
         * Date when video has been uploaded in Unixtime
         */
        date?: number;
        /**
         * Number of views
         */
        views?: number;
        /**
         * Number of comments
         */
        comments?: number;
        /**
         * URL of the preview image with 130 px in width
         */
        photo_130?: string;
        /**
         * URL of the preview image with 320 px in width
         */
        photo_320?: string;
        /**
         * URL of the preview image with 800 px in width
         */
        photo_800?: string;
        /**
         * Video access key
         */
        access_key?: string;
        /**
         * Date when the video has been added in Unixtime
         */
        adding_date?: number;
        /**
         * URL of the page with a player that can be used to play the video in the browser.
         */
        player?: string;
        /**
         * Information whether current user can edit the video
         */
        can_edit?: 0 | 1;
        /**
         * Information whether current user can add the video
         */
        can_add?: 0 | 1;
        /**
         * Returns if the video is processing
         */
        processing?: 1;
        /**
         * Returns if the video is live translation
         */
        live?: 1;
        files?: {
            /**
             * URL of the mpeg4 file with 240p quality
             */
            mp_240?: string;
            /**
             * URL of the mpeg4 file with 360p quality
             */
            mp_360?: string;
            /**
             * URL of the mpeg4 file with 480p quality
             */
            mp_480?: string;
            /**
             * URL of the mpeg4 file with 720p quality
             */
            mp_720?: string;
            /**
             * URL of the mpeg4 file with 1080p quality
             */
            mp_1080?: string;
            /**
             * URL of the external player
             */
            external?: string;
        };
    }[];
}

export interface FaveGetUsersResponse {
    /**
     * Total number
     */
    count?: number;
    items?: FaveUser[];
}

export interface LikesGenereicResponse {
    likes: number
}


export interface NewsfeedGetCommentsRequest {
    last_comments_count: number;

    count: number;

    start_time?: number
}

export interface NotificationsRequest {
    filters: string;
    count: number;
    start_time?: number
}

export interface NewsfeedGetCommentsResponse {

}

export interface FriendsRequest {
    count: number
    items: UserProfile[]
}

export interface UsersGetRequest {
    count: number
    items: UserProfile[]
}


export interface LongPollServerRS {
    ts: string
    key: string
    server: string
}


export interface LongPollRS {
    ts: string
    updates: LPMessage[]

    // bad style here
    failed?: number
}

export interface GenericRS<I> {
    count: number
    items: I[]
}


export interface Message {
    id          : number
    from_id     : number
    peer_id     : number
    date        : number;
    out         : number;
    text        : string
    attachments?: AttachmentContainer[]

    random_id   ?: number
    chat_id     ?: number

    fwd_messages?: FwdMessage[]
    reply_message?: FwdMessage
}

interface FwdMessage {
    attachments?: AttachmentContainer[]
    conversation_message_id: number
    date    : number
    from_id: number
    id: number
    peer_id : number
    text    : string
}

type Action = ChatKickUser | ChatInviteUser

interface ChatKickUser {
    member_id: number
    type: "chat_kick_user" | "chat_pin_message"
}

interface ChatInviteUser {
    type: "chat_invite_user" | "chat_invite_user_by_link" | "chat_create"
}

export interface MessageWithAction extends Message {
    action: Action

    action_email: string
    action_text : string
}

export interface VkDialog {
    in_read : number
    out_read: number
    message : Message
}

export interface Peer {
    id: number
    local_id: number
    type: "user" | "chat" | "group" | "email"
}

export interface CanWrite {
    allowed: boolean
}

interface PushSettings {
    disabled_forever: boolean
    no_sound: boolean
}

export interface VkConversation {
    can_write: CanWrite
    in_read: number
    last_message_id: number
    out_read: number
    peer: Peer
    push_settings?: PushSettings
}

export interface WithBot {
    current_keyboard: object
}

export interface ChatPhoto {
    photo_50: string,
    photo_100: string,
    photo_200: string,
}

export interface WithTitle {
    title: string
}

export interface ChatSettings extends WithTitle {
    acl: object
    active_ids: number[]
    admin_ids: number[]
    members_count: number
    owner_id: number
    photo?: ChatPhoto
    state: "in"
}

export interface VkConversationChat extends VkConversation {
    chat_settings: ChatSettings
    unread_count: number
}

export interface VkConversationCnt {
    conversation: VkConversation
    last_message: Message
}

export type MessagesGetDialogsResponse = GenericRS<VkDialog>
export interface MessagesGetConversationsResponse extends GenericRS<VkConversationCnt> {
    unread_count: number
}

export interface MessagesGetConversationsResponseExtended extends MessagesGetConversationsResponse{
    groups: GroupProfile[]
    profiles: UserProfile[]
}

export type IsOnline = 0 | 1;

interface MessagesLastActivityResponse {
    online  : IsOnline
    time    : number
}

interface MessageHistory {
    id          : number
    out         : number
    body        : string
    date        : number
    from_id     : number
    read_state  : number
    user_id     : number
}

export interface MessagesGetHistoryResponse extends GenericRS<Message>{
    in_read : number
    out_read: number
    unread  : number
}

export type MessagesGetByIdResponse = GenericRS<Message> | boolean
export type MessagesGetConversationsByIdResponse = GenericRS<VkConversation> | boolean

export interface WallCreateComment {
    owner_id: number
    post_id : number
    message : string

    reply_to_comment ?: number
}

export interface BoardCreateComment {
    group_id: number
    topic_id: number
    message : string
}

export interface PhotosCreateComment {
    owner_id: number
    photo_id: number
    message : string
}

export interface VideoCreateComment {
    owner_id: number
    video_id: number
    message : string
}