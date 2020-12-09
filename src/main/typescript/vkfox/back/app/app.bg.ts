"use strict";
import Browser from "../browser/browser.bg";
import {browser} from "webextension-polyfill-ts"
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
import VKfoxNotifications from "../notifications/notifications.bg";
import Groups from "../groups/groups.bg";


Browser.init();
Auth.init();
Buddies();
Users.init();
Groups.init();
ChatBg();
NewsfeedBg();
VKfoxNotifications.init();
FeedbacksBg();
RouterBg.init();
LikesBg();
ForceOnlineBg();
LongpollBg();

InstallPageOrLogin();

if (process.env.NODE_ENV === "development")
 browser.tabs.create({url: "/pages/popup.html"});

