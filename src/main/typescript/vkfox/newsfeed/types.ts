import {Collection, Model} from "backbone";
import {FoxUserProfileI} from "../chat/types";
import {ItemObj, UserId} from "../../vk/types/newsfeed";
import {idMaker} from "../back/newsfeed/newsfeed.bg";
import {LikesObj} from "../../vk/types/objects";




class ItemDupl extends Model {
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




export class Item extends Model {

    get friends(): UserId[] {
        return super.get("friends")
    }

    set likes(value: LikesObj) {
        super.set("likes", value)
    }

    get date(): number {
        return super.get("date");
    }

    get source_id(): number {
        return super.get("source_id")
    }

    parse(item: ItemObj) {
        item.id = idMaker(item);

        return item;
    }
}

export class ItemsColl extends Collection<Item> {
    model = Item;

    comparator = (item: Item) => -item.date
}




/*class Profile extends Model {
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
}*/
