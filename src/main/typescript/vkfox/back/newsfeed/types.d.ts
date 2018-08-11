import {UserLikesObj} from "../../../vk/types/objects";

/**
 * @param [Object] params
 * @param [String] params.action 'delete' or 'add'
 * @param [String] params.type 'post', 'comment' etc
 * @param [Number] params.owner_id
 * @param [Number] params.item_id
 */
export interface LikesChanged {
    action: string
    type: string
    owner_id: number
    item_id: number

    likes: UserLikesObj
}