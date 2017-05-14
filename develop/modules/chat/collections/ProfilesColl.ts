import {Collection, Model} from "backbone";

export class Profile extends Model {
    uid: number;

    public get idAttribute () { return "uid" }
}

export class ProfilesColl extends Collection<Profile> {
    model = Profile;
}