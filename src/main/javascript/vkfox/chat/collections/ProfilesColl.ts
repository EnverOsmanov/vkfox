import {Collection, Model} from "backbone";

type Sex = 0 | 1 | 2

export interface ProfileI {
    uid     : number;
    photo   : string;
    sex     : Sex;
    nickname: string;
    lists   : string
    isFave ?: boolean
    online  : number
}

export class Profile extends Model {
    uid: number;

    public get idAttribute () { return "uid" }
}

export class ProfilesColl extends Collection<Profile> {
    model = Profile;
}