import {GroupProfile} from "../../../../common/users/types";
import ProxyMethods from "../../../../proxy-methods/proxy-methods.pu";
import {ProxyNames} from "../../../../mediator/messages";

export default {
    getProfilesById(ids: number[]): Promise<GroupProfile[]> {
        return ProxyMethods.forwardM(ProxyNames.GroupsBg, "getProfilesById", ids)
    }
}