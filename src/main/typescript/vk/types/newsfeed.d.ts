import {ProfileI, UserProfile} from "../../vkfox/back/users/types";
import {GenericRS} from "./index";
import {WithUserLikes, ZeroOne} from "./feedback";
import {AttachmentContainer, AttachmentPhoto} from "./attachment";


export interface ItemObj {
    id      ?: string;
    type     : string;
    date     : number
    source_id: number;
}

export interface WithCopyHistory {
    copy_history?: PostItem[]
}


export interface PostItem extends ItemObj, WithUserLikes, WithCopyHistory {
    text       ?: string
    attachments?: AttachmentContainer[]
    comments    : CanPostable

    post_id     : number
    post_type   : string
    post_source : PostSource
}

export interface PhotoItem extends ItemObj {
    owner_id: number // added for notifications.get (parent)
}

export interface PhotoTagItem extends ItemObj {
    photo_tags: GenericRS<AttachmentPhoto>
}

export interface WallPhotoItem extends ItemObj {
    // type = "wall_photo"

    photos: GenericRS<AttachmentPhoto>
}

export interface FriendItem extends ItemObj {
    // type = "friend"

    friends?: GenericRS<UserId>
}

export interface AudioItem extends ItemObj {
    // type = "audio";

    audio: GenericRS<AudioAudio>
}

export interface VideoItem extends ItemObj {
    // type = "video";

    video: GenericRS<VideoVideo>

    owner_id: number // added for notifications.get (parent)
}


export interface NewsfeedData {
    profiles: UserProfile[]
    items: ItemObj[]
}


interface CanPostable {
    can_post: number
}

interface VkLink {
    description: string
    title: string
    url: string
}


// PostSources
interface PostSource {
    type: "widget" | "api" | "vk" | "mvk"
}

interface WidgetSource extends PostSource {
    type: "widget"
    data: "comments"
    link: VkLink
}

interface ApiSource extends PostSource {
    type: "api"
}

interface VkSource extends PostSource {
    type: "vk"
}

interface UserMeta extends PostSource{
    platform: string
}
//

export interface VideoVideo {
    id      : number
    title   : string
}

export interface AudioAudio {
    aid     : number
    artist  : string
    title   : string
    duration: number
}




declare namespace media {

    interface Video {
        access_key  : string
        can_add     : ZeroOne
        can_edit    : ZeroOne
        description : string
        duration    : number
        id          : number
        owner_id    : number
        photo_130   : string
        photo_320   : string
        views       : number
        title       : string
    }

    interface Photo {
        id          : number
        owner_id    : number
        date        : number
        photo_75    : string
        photo_130   : string
        photo_604   : string
        photo_807   : string
        photo_1280 ?: string
        photo_2560 ?: string
        text        : string
        user_id     : number
        height      : number
        width       : number
        album_id    : number
        access_key  : string
    }
}




/*export interface Photo {
    id          : number
    album_id    : number
    can_comment : number
    can_repost  : number
    date        : number
    height      : number
    width       : number
}*/

export interface UserId {
    user_id: number
}

export interface NewsfeedRequestParams {
    count       : number,
    start_time  ?: number
}


interface Newsfeed {
    profiles: ProfileI[]
    groups  : ProfileI[]
    items   : ItemObj[]

    next_from ?: string
}

export interface NewsfeedResp {
    newsfeed: Newsfeed

    time    : number
}

interface PhotoSizeI {
    src     : string
    type    : string
    width   : number
    height  : number
}

interface PreviewPhoto {
    sizes: PhotoSizeI[]
}

interface PreviewVideo {
    src         : string
    file_size   : number
    height      : number
    width       : number
}

interface PreviewGraffiti {
    src     : string
    width   : number
    height  : number
}

interface PreviewAudioMsg {
    duration: number
    waveform: number[]
    link_ogg: string
    link_mp3: string
}

interface AttachPreviewI {
    video       ?: PreviewVideo
    photo       ?: PreviewPhoto
    graffiti    ?: PreviewGraffiti
    audio_msg   ?: PreviewAudioMsg
}