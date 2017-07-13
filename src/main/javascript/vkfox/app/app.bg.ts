"use strict";
import Tracker from "../tracker/tracker";
import Browser from "../browser/browser.bg";
import Buddies from "../buddies/buddies.bg";
import ChatBg from "../chat/chat.bg";
import NewsfeedBg from "../newsfeed/newsfeed.bg";
import FeedbacksBg from "../feedbacks/feedbacks.bg";
import RouterBg from "../router/router.bg";
import LikesBg from "../likes/likes.bg";
import ForceOnlineBg from "../force-online/force-online.bg";
import LongpollBg from "../longpoll/longpoll.bg";
import InstallPageOrLogin from "../yandex/yandex.bg";
import Auth from "../auth/auth.bg";
import Users from "../users/users.bg";

try {
    Browser.init();
    Auth.init();
    Buddies();
    ChatBg();
    NewsfeedBg();
    FeedbacksBg();
    RouterBg.init();
    LikesBg();
    ForceOnlineBg();
    LongpollBg();
    Users.init();

    InstallPageOrLogin();
} catch (e)  {
    Tracker.error(e);
    throw e;
}
/*
"use strict";
import Tracker from "../tracker/tracker";
import Request from "../request/request.bg";
import Auth from "../auth/auth.bg";
import {AccessTokenError} from "../request/models";
import {LongPollRS, LongPollServerRS} from "../longpoll/models";

const LONG_POLL_WAIT = 25;
const API_VERSION             = 4.99;
const API_DOMAIN              = 'https://api.vk.com/';
const method = "execute";

const executeCode = "return [API.messages.getLongPollServer()];"

try {

    Auth.init();
    Auth.login().then(getLongPoll)
} catch (e)  {
    Tracker.error(e);
    throw e;
}


function handleError(e: Error) {
    if (e instanceof AccessTokenError) {
        console.error("LongPoll failed... Retrying", e.message)
    }
    else console.error("LongPoll failed... Retrying", e);
}

function getLongPoll(data) {
    console.debug("GetLongPoll", data.accessToken);
    const params = {
        method      : 'execute',
        code        : executeCode,
        access_token: data.accessToken,
        v           : API_VERSION
    };

    return Request
    //.api({ code: "return [API.messages.getLongPollServer()];" })
        .post(`${API_DOMAIN}method/${method}`, params)
        .then(rs => {
                console.debug("Success getServer");
                return fetchUpdates(rs.response[0])
            },
            handleError
        ).catch(e => console.debug("Final EROOR", e))
}


function fetchUpdates(serverRS: LongPollServerRS) {


    const params = {
        act : 'a_check',
        key : serverRS.key,
        ts  : serverRS.ts,
        wait: LONG_POLL_WAIT,
        mode: 2
    };

    function handleSuccess(response: LongPollRS) {
        if (response.failed == 2) {
            return Auth.login(true).then(getLongPoll, e =>  console.debug("Failed Relogin", e))
        }
        else {
            console.debug("Success LongPollRS", response)
            serverRS.ts = response.ts;

            return fetchUpdates(serverRS)
        }
    }

    return Request
        .get(`https://${serverRS.server}`, params, "json")
        .then(handleSuccess, (e) => {
            console.debug("Failed LongPollRS", e);
        })
}*/
