
import {ProfileI} from "../chat/collections/ProfilesColl";



export interface UsersGetElem {
    uids: number[];

    promise(ProfileI): void
}
