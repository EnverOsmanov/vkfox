import {Collection, Model} from "backbone";

export interface OnlyName {
    name: string
}

export interface NameSurname {
    first_name  : string
    last_name   : string
}

type Sex = 0 | 1 | 2

export interface ProfileI extends NameSurname {
    uid     : number;
    photo   : string;
    sex     : Sex;
    nickname: string;
    lists   : string
    isFave ?: boolean
    online  : number

    // Properties added by Vkfox
    isWatched           ?: boolean
    lastActivityTime    ?: number
}

export class Profile extends Model {
    uid: number;

    public get idAttribute () { return "uid" }
}

export class ProfilesColl extends Collection<Profile> {
    model = Profile;
}