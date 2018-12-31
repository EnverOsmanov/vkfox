import {AttachPreviewI, media, PostItem} from "./newsfeed";

export interface Attachment {}

export interface AttachmentContainer {
    type: "photo" | "audio" | "video" | "wall" | "note" | "doc" | "poll" | "graffiti"
}

export interface AttachmentPhoto extends Attachment, media.Photo {}



export interface AttachmentPhotoContainer extends AttachmentContainer {
    type : "photo"
    photo: AttachmentPhoto
}

export interface AttachmentAudio extends Attachment {
    artist  : string
    title   : string
}

export interface AttachmentAudioContainer extends AttachmentContainer {
    type : "audio"
    audio: AttachmentAudio
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
    type: "doc"
    doc : AttachmentDoc
}

export interface AttachmentPoll extends Attachment {
    question: string
}

export interface AttachmentPollContainer extends AttachmentContainer {
    type: "poll"
    poll: AttachmentPoll
}

export interface AttachmentLink extends Attachment {
    url: string
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
    type: "video"
    video: AttachmentVideo
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

export interface AttachmentGift extends Attachment {
    id          : number
    thumb_48    : string
    thumb_96    : string
    thumb_256   : string
}