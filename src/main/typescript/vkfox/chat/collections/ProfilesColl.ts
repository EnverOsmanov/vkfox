import {Collection, Model} from "backbone";




export class PuChatUserProfile extends Model {
    uid: number;

    set isSelf(value: boolean) {
        super.set("isSelf", value)
    }

}

export class PuChatUserProfilesColl extends Collection<PuChatUserProfile> {
    model = PuChatUserProfile;
}