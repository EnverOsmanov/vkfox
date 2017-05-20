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

    InstallPageOrLogin();
} catch (e)  {
    Tracker.error(e);
    throw e;
}
