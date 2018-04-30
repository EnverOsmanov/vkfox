"use strict";
import ProxyMethods from '../proxy-methods/proxy-methods.pu';
import {ProfileI, UserProfile} from "../back/users/types";


const namespace = "../users/users.bg.ts";

export default {
    getProfilesById(userIds: number[]): Promise<UserProfile[]> {
        return ProxyMethods.forwardM(namespace, "getProfilesById", userIds)
    }
}
