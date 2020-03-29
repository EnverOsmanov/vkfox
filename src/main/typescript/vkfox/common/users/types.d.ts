import {NameSurname, OnlyName } from "../chat/types";


type IsOnline = 0 | 1;
export const enum Sex { Male, Female, Unknown }

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