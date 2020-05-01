import {ItemObj, PostItem} from "../../../vk/types/newsfeed";


export function idMaker(item: ItemObj): string {
    const post_id = "post_id" in item
        ? (item as PostItem).post_id
        : "";

    return [item.source_id, post_id, item.type].join(":");
}