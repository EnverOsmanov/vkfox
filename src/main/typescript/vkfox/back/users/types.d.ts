import {ProfileI} from "../../common/users/types";


export interface UsersGetElem {
    uids: number[];

    promise(p: ProfileI[]): void
}