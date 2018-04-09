import {NameSurname, OnlyName, ProfileI} from "../../chat/types";

export interface UserI {
    uid: number
}

type IsOnline = 0 | 1;
export type Sex = 0 | 1 | 2

export interface UserProfile extends UserI, NameSurname {
    photo   : string;
    sex     : Sex;
    nickname: string;
    lists   : string
    isFave ?: boolean
    online  : IsOnline
}

export interface GroupProfile extends OnlyName {
    id      : number
    photo   : string
}


export interface UsersGetElem {
    uids: number[];

    promise(p: ProfileI[]): void
}