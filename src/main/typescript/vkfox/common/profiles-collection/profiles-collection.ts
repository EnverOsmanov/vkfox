"use strict";
import {AddOptions, Silenceable} from "backbone";


class ProfilesAddOptions implements AddOptions {
    parse = true;

    merge = false;
}

class SilentAddOptions implements Silenceable {
    silent = true
}

export class BBCollectionOps {
    static beSilentOptions = new SilentAddOptions();
    static addOptions = new ProfilesAddOptions()
}
