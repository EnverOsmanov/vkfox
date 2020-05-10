import {GroupProfile} from "../../common/users/types";
import RequestBg from "../request/request.bg";
import ProxyMethods from "../../proxy-methods/proxy-methods.bg";
import {ProxyNames} from "../../mediator/messages";

class Groups {
    static init() {
        ProxyMethods.connect(ProxyNames.GroupsBg, Groups);
    }

    static getProfilesById(missingIds: number[]): Promise<GroupProfile[]> {
        const code = `return API.groups.getById({group_ids: '${missingIds.join()}'})`

        return RequestBg.api<GroupProfile[]>({code})
    }
}

export default Groups