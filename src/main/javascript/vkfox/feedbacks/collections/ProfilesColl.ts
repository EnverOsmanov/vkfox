"use strict";
import {AddOptions, Model} from "backbone";

import ProfilesCollection from "../../profiles-collection/profiles-collection.bg"

export interface ProfileObj {
    sex: number
    photo: string
}

export interface GroupObj {}

class Profile extends Model {
    parse(profile) {
        if (profile.gid) profile.id = -profile.gid;
        else profile.id = profile.uid;

        return profile;
    }
}

class ProfilesAddOptions implements AddOptions {
    parse = true;

    merge?: boolean;
}

export class Profiles extends ProfilesCollection<Profile> {
    model = Profile;

    static addOptions = new ProfilesAddOptions()
}