/*
"use strict";
import * as _ from "lodash"
import * as Config from "../config/config"
import RequestBg from "../request/request.bg"
import Auth from "../auth/auth.bg"
import Mediator from "../mediator/mediator.bg"
import {Msg} from "../mediator/messages";

const CHECK_AUTH_PERIOD = 3000; //ms
let userId;

export default function init() {
    /!**
     * Monitor whether the user is logged/relogged on vk.com.
     * Logout if user signed out. Relogin when user id changed
     *!/
    const monitorAuthChanges = _.debounce(function () {
        RequestBg
            .get(Config.VK_BASE + 'feed2.php', null, 'json')
            .then(function (response) {
                try {
                    if (userId !== Number(response.user.id)) {
                        console.error("No user!");
                        Auth.login(true);
                    }
                    else monitorAuthChanges();
                }
                catch (e) {
                    console.error("Auth-monitor:", response, e);
                    Auth.login(true);
                }
            }, monitorAuthChanges);
    }, CHECK_AUTH_PERIOD);

    Mediator.sub(Msg.AuthSuccess, (data) => {
        userId = data.userId;
        monitorAuthChanges();
    });
}

*/
