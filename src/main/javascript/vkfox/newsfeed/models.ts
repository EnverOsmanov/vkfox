import {Collection, Model} from "backbone";
import {LikesObj} from "../feedbacks/collections/FeedBacksCollection";


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

interface Friend {
    uid: number
}

export interface ItemObj {
    id      ?: string;
    type     : string;
    source_id: number;
    post_id  : string;
    photos   : (number | Photo)[];
    friends  : (number | Friend)[]
}


export class Item extends Model {

    get friends(): (number | Friend)[] {
        return super.get("friends")
    }

    set likes(value: LikesObj) {
        super.set("likes", value)
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
}

interface Attachment {
    type : string
    photo: string
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


export interface Post extends ItemObj {
    attachments: Attachment[]
}