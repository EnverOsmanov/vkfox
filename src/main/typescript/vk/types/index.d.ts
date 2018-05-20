import {UserProfile} from "../../vkfox/back/users/types";
import {LPMessage} from "../../vkfox/back/longpoll/models";
import {AttachmentContainer} from "./newsfeed";

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
    items?: UserProfile[];
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
    ts: number
    key: string
    server: string
}


export interface LongPollRS {
    ts: number
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
    user_id     : number
    read_state  : number;
    date        : number;
    out         : number;
    body        : string
    title       : string
    attachments?: AttachmentContainer[]

    chat_active ?: number[];
    random_id   ?: number
    chat_id     ?: number

    fwd_messages?: FwdMessage[]
}

interface FwdMessage {
    user_id : number
    date    : number
    body    : string

    attachments?: AttachmentContainer[]
}

type MessageActionT =
    "chat_kick_user" |
    "chat_invite_user" |
    "chat_create"

export interface MessageWithAction extends Message {
    action: MessageActionT

    action_mid  : number
    action_email: string
    action_text : string
}

export interface VkDialog {
    in_read : number
    out_read: number
    message : Message
}

export interface MessagesGetDialogsResponse extends GenericRS<VkDialog>{

}


interface MessagesLastActivityResponse {
    online  : number // 0 or 1
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