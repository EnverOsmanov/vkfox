import {Collection, Model} from "backbone";
import {LikesObj} from "../feedbacks/collections/FeedBacksCollection";
import {ProfileI} from "../chat/collections/ProfilesColl";

export interface NewsfeedRequestParams {
    count: number,
    start_time?: number
}

export interface NewsfeedData {
    profiles: ProfileI[]
    items: ItemObj[]
}

interface Newsfeed {
    profiles
    groups
    items: ItemObj[]
}

export interface NewsfeedResp {
    newsfeed: Newsfeed

    time: number
}



class ItemDupl extends Model {
    parse(item) {
        item.id = item.pid || item.nid || item.pid;
        return item;
    }
}

export class ItemDulpColl extends Collection<ItemDupl> {
    model = ItemDupl
}

/**
 * @param [Object] params
 * @param [String] params.action 'delete' or 'add'
 * @param [String] params.type 'post', 'comment' etc
 * @param [Number] params.owner_id
 * @param [Number] params.item_id
 */
export interface LikesChanged {
    action  : string
    type    : string
    owner_id: number
    item_id : number

    likes   : LikesObj
}

export interface Photo {
    pid: string //or number?
}

export interface Friend {
    uid: number
}

export interface ItemObj {
    id      ?: string;
    type     : string;
    date     : number
    source_id: number;
    post_id  : number;
}


export class Item extends Model {

    get friends(): (number | Friend)[] {
        return super.get("friends")
    }

    set likes(value: LikesObj) {
        super.set("likes", value)
    }

    get date(): number {
        return super.get("date");
    }

    parse(item: ItemObj) {
        item.id = [
            item.source_id,
            item.post_id,
            item.type
        ].join(':');

        return item;
    }
}

export class ItemsColl extends Collection<Item> {
    model = Item;

    comparator = (item: Item) => -item.date
}

export interface Attachment {}

export interface AttachmentContainer {
    type: string
}

export interface AttachmentPhoto {}

export interface AttachmentPhotoContainer extends AttachmentContainer {
    type : string
    photo: AttachmentPhoto
}

export interface AttachmentAudio extends Attachment {
    performer: string
    title    : string
}

export interface AttachmentAudioContainer extends AttachmentContainer {
    type : string
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

export interface AttachmentDoc extends Attachment {
    url     : string
    title   : string
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
    src_big: string
}

export interface AttachmentGraffitiContainer extends AttachmentContainer {
    type    : string
    graffiti: AttachmentGraffiti
}


export interface AttachmentVideo extends Attachment {
    owner_id    : number
    vid         : number
    access_key  : string
    image       : string
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



class Profile extends Model {
    gid: number;
    uid: number;

    parse(profile: Profile) {
        if (profile.gid) profile.id = -profile.gid;
        else profile.id = profile.uid;

        return profile;
    }
}


export class ProfilesColl extends Collection<Profile> {
    model = Profile
}

interface CanPostable {
    can_post: boolean
}


export interface PostItem extends ItemObj {
    text       ?: string
    attachments?: AttachmentContainer[]
    comments    : CanPostable
    likes       : LikesObj
}

export interface PhotoItem extends ItemObj {}

export interface PhotoTagItem extends ItemObj {
    photo_tags: Photo[]
}

export interface WallPhotoItem extends ItemObj {
    // type = "wall_photo"

    photos: (number | Photo)[]
}

export interface FriendItem extends ItemObj {

    friends: (number | Friend)[]
}

export interface AudioItem extends ItemObj {
    // type = "audio";

    audio: (number | AudioAudio)[]
}

export interface VideoItem extends ItemObj {
    // type = "video";

    video: (number | VideoVideo)[]
}

export interface VideoVideo {
    vid: number
    title: string
}

export interface AudioAudio {
    aid     : number
    artist  : string
    title   : string
    duration: number
}