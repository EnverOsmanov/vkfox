import {NameSurname, OnlyName } from "../../chat/types";


type IsOnline = 0 | 1;
export type Sex = 0 | 1 | 2

export interface ProfileI {
    id      : number

    photo_200   ?: string
    photo_100   ?: string
    photo_50    ?: string
    photo       ?: string
}

export interface UserProfile extends NameSurname, ProfileI {
    sex     : Sex
    nickname: string
    lists  ?: string
    isFave ?: boolean
    online  : IsOnline
}

export interface FriendProfile extends UserProfile {
    isFriend: boolean
}

export interface GroupProfile extends OnlyName, ProfileI {
    type: string
}


export interface UsersGetElem {
    uids: number[];

    promise(p: ProfileI[]): void
}