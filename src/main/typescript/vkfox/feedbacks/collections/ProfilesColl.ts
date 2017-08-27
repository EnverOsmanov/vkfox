"use strict";
import {AddOptions, Model, Silenceable} from "backbone";

import ProfilesCollection from "../../profiles-collection/profiles-collection.bg"
import {NameSurname, OnlyName} from "../../chat/collections/ProfilesColl";

export interface ProfileObj extends NameSurname {
    id        : number
    first_name: string
    last_name : string
    photo     : string
}

export interface GroupObj extends OnlyName {
    id      : number
    name    : string
    photo   : string
}

class Profile extends Model {
    parse(profile) {
        if (profile.gid) profile.id = -profile.gid;
        else profile.id = profile.uid;

        return profile;
    }
}

class ProfilesAddOptions implements AddOptions {
    parse = true;

    merge = false;
}

export class SilentAddOptions implements Silenceable {
    silent: boolean = true
}


export class Profiles extends ProfilesCollection<Profile> {
    model = Profile;

    static beSilentOptions = new SilentAddOptions();
    static addOptions = new ProfilesAddOptions()
}