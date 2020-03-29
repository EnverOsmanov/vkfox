"use strict";
import ProxyMethods from '../../../../proxy-methods/proxy-methods.pu';
import {UserProfile} from "../../../../common/users/types";
import {ProxyNames} from "../../../../mediator/messages";


export default {
    getProfilesById(userIds: number[]): Promise<UserProfile[]> {
        return ProxyMethods.forwardM(ProxyNames.UsersBg, "getProfilesById", userIds)
    }
}
