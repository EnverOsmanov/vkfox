import {ProfileI, UserProfile} from "../../vkfox/back/users/types";
import {GenericRS} from "./index";
import {WithUserLikes} from "./feedback";

export interface ItemObj {
    id      ?: string;
    type     : string;
    date     : number
    source_id: number;
}


export interface PostItem extends ItemObj, WithUserLikes {
    text       ?: string
    attachments?: AttachmentContainer[]
    comments    : CanPostable

    post_id     : number
    post_type   : string
    post_source : UserMeta
    copy_history?: PostItem[]
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

interface UserMeta {
    type: string
    platform: string
}


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


export interface Attachment {}

export interface AttachmentContainer {
    type: string
}

export interface AttachmentPhoto extends Attachment {
    id          : number
    owner_id    : number
    date        : number
    photo_75    : string
    photo_130   : string
    photo_604   : string
    photo_807   : string
    text        : string
    user_id     : number
    height      : number
    width       : number
    album_id    : number
    access_key  : string
}

export interface AttachmentPhotoContainer extends AttachmentContainer {
    // type : string = "photo"
    photo: AttachmentPhoto
}

export interface AttachmentAudio extends Attachment {
    artist  : string
    title   : string
}

export interface AttachmentAudioContainer extends AttachmentContainer {
    // type : string = "audio"
    audio: AttachmentAudio
}

export interface AttachmentNote extends Attachment {
    owner_id: string
    title   : string
    nid     : string
}

export interface AttachmentNoteContainer extends AttachmentContainer {
    type: string
    note: AttachmentNote
}

type AttachmentDocType =
    1 | // text document
    2 | // archive
    3 | // gif
    4 | // image
    5 | // audio
    6 | // video
    7 | // e-book
    8   // unknown


export interface AttachmentDoc extends Attachment {
    id: number
    owner_id: number
    size: number
    date: number
    url     : string
    title   : string
    type    : AttachmentDocType
    ext     : string
    preview : AttachPreviewI
}

export interface AttachmentDocContainer extends AttachmentContainer {
    type: string
    doc : AttachmentDoc
}

export interface AttachmentPoll extends Attachment {
    question: string
}

export interface AttachmentPollContainer extends AttachmentContainer {
    type: string
    poll: AttachmentPoll
}

export interface AttachmentLink extends Attachment {
    url: string
}

export interface AttachmentAudioContainer extends AttachmentContainer {
    type: string
    link: AttachmentLink
}


export interface AttachmentGraffiti extends Attachment {

}

export interface AttachmentGraffitiContainer extends AttachmentContainer {
    type    : string
    graffiti: AttachmentGraffiti
}


export interface AttachmentVideo extends Attachment {
    owner_id    : number
    id          : number
    access_key  : string
    photo_130   : string
    photo_320   : string
    title       : string
    duration    : number
}

export interface AttachmentVideoContainer extends AttachmentContainer {
    type: string
    video: AttachmentVideo
}

export interface AttachmentWallContainer extends AttachmentContainer {
    wall: AttachmentWall
}

export interface AttachmentWall extends Attachment {
    from_id     : number
    id          : number
    likes       : object
    post_type   : string
    text        : string
    attachments : AttachmentContainer[]
}

interface AStickerImage {
    height  : number
    width   : number
    url     : string
}

export interface AttachmentSticker extends Attachment {
    sticker_id              : number
    product_id              : number
    animation_url           : string
    images                  : AStickerImage[]
    images_with_background  : AStickerImage[]
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