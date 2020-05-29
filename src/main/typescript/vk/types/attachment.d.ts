import {AttachPreviewI, media, PostItem} from "./newsfeed";

export interface Attachment {}

export type AttachmentT =
    "photo" |
    "audio" |
    "audio_message" |
    "video" |
    "wall" |
    "market" |
    "page" |
    "wall_reply" |
    "note" |
    "doc" |
    "poll" |
    "graffiti" |
    "podcast" |
    "link" |
    "posted_photo" |
    "sticker" |
    "gift"

export interface AttachmentContainer {
    type: AttachmentT
}

export interface AttachmentPhotoContainer extends AttachmentContainer {
    type : "photo"
    photo: media.Photo
}
/*
export interface AttachmentAudio extends Attachment {
    artist  : string
    title   : string
}*/

export interface AttachmentAudioContainer extends AttachmentContainer {
    type : "audio"
    audio: media.Audio
}

export interface AttachmentNote extends Attachment {
    owner_id: string
    title   : string
    nid     : string
}

export interface AttachmentNoteContainer extends AttachmentContainer {
    type: "note"
    note: AttachmentNote
}



declare const enum AttachmentDocType {
    Text = 1, // text document
    Archive, // archive
    Gif, // gif
    Image, // image
    Audio, // audio
    Video, // video
    Ebook, // e-book
    Unknown   // unknown
}


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
    type: "doc"
    doc : AttachmentDoc
}

export interface AttachmentPoll extends Attachment {
    anonymouse  : number
    answer_id   : number
    answers     : PollAnswer[]
    created     : number
    id          : number
    owner_id    : number
    question    : string
    votes       : number
}

export interface AttachmentPollContainer extends AttachmentContainer {
    type: "poll"
    poll: AttachmentPoll
}

export interface AttachmentLink extends Attachment {
    type: "link"
    url         : string
    title       : string
    description : string
    photo       ?: media.Photo
    button      ?: LinkButton
    caption     ?: string
}

export interface AttachmentAudioContainer extends AttachmentContainer {
    type: "audio"
    link: AttachmentLink
}


export interface AttachmentGraffiti extends Attachment {

}

export interface AttachmentGraffitiContainer extends AttachmentContainer {
    type    : "graffiti"
    graffiti: AttachmentGraffiti
}


/*export interface AttachmentVideo extends Attachment {
    owner_id    : number
    id          : number
    access_key  : string
    photo_130   : string
    photo_320   : string
    title       : string
    duration    : number
}*/

export interface AttachmentVideoContainer extends AttachmentContainer {
    type: "video"
    video: media.Video
}

export interface AttachmentWallContainer extends AttachmentContainer {
    type: "wall"
    wall: AttachmentWall
}

export interface AttachmentWall extends Attachment {
    access_key      : string
    attachments     ?: AttachmentContainer[]
    comments        : object
    copy_history    : PostItem[]
    date            : number
    from_id         : number
    id              : number
    likes           : object
    marked_as_ads   : number
    post_source     : object
    post_type       : string // "wall"
    reposts         : object
    text            : string
    to_id           : number
    views           : object
}

export interface AttachmentWallReplyContainer extends AttachmentContainer {
    type: "wall_reply"
    wall: AttachmentWallReply
}

export interface AttachmentWallReply extends Attachment {
    date: number
    id: number
    owner_id: number
    post_id: number
    text: string
}

export interface AttachmentPageContainer extends AttachmentContainer {
    type: "page"
    wall: AttachmentPage
}

export interface AttachmentPage extends Attachment {
    created: 1412409214
    edited: 0
    group_id: 54530371
    id: 48776757
    title: "Подборка материалов по Java"
    view_url: "https://m.vk.com/page-54530371_48776757?api_view=2b2b625ee88dc792bffc3fc4bc7d07"
    views: 77957
    who_can_edit: 0
    who_can_view: 2
}


interface AStickerImage {
    height  : number
    width   : number
    url     : string
}

export interface AttachmentSticker extends Attachment {
    sticker_id              : number
    product_id              : number
    images                  : AStickerImage[]
    images_with_background  : AStickerImage[]
}

export interface AnimationSticker extends AttachmentSticker {
    animation_url: string
}

export interface AttachmentGift extends Attachment {
    id          : number
    thumb_48    : string
    thumb_96    : string
    thumb_256   : string
}

export interface LinkButton {
    title: string
    action: {
        type: string
        url: string
    }
}

export interface PollAnswer {
    id      : number
    rate    : number
    text    : string
    votes   : number
}