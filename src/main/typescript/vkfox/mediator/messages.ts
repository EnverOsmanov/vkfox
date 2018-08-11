"use strict";

export const Msg = {

    AuthUser    : "auth:user",
    AuthToken   : "auth:token",
    AuthIframe  : "auth:iframe",
    AuthStateGet: "auth:state:get",
    AuthState   : "auth:state",
    AuthOauth   : "auth:oauth",
    AuthReady   : "auth:login",

    BuddiesData       : "buddies:data",
    BuddiesDataGet    : "buddies:data:get",
    BuddiesWatchToggle: "buddies:watch:toggle",

    ChatData       : "chat:data",
    ChatDataGet    : "chat:data:get",
    ChatMessageRead: "chat:message:read",

    FeedbacksData       : "feedbacks:data",
    FeedbacksDataGet    : "feedbacks:data:get",
    FeedbacksUnsubscribe: "feedbacks:unsubscribe",

    ForceOnlineSettings     : "forceOnline:settings",
    ForceOnlineSettingsGet  : "forceOnline:settings:get",
    ForceOnlineSettingsPut  : "forceOnline:settings:put",

    LongpollUpdates: "longpoll:updates",

    LikesChange : "likes:change",
    LikesChanged: "likes:changed",

    NewsfeedFriends   : "newsfeed:friends",
    NewsfeedFriendsGet: "newsfeed:friends:get",
    NewsfeedGroups    : "newsfeed:groups",
    NewsfeedGroupsGet : "newsfeed:groups:get",

    NotificationsSettings   : "notifications:settings",
    NotificationsSettingsGet: "notifications:settings:get",
    NotificationsSettingsPut: "notifications:settings:put",

    NotificationsQueue: "notifications:queue",
    NotificationsQueueGet: "notifications:queue:get",

    RouterChange     : "router:change",
    RouterLastPathPut: "router:lastPath:put",

    YandexDialogClose: "yandex:dialog:close",
    YandexSettingsPut: "yandex:settings:put"
};

export const ProxyNames = {
    RequestBg: "../request/request.bg.ts",
    UsersBg: "../users/users.bg.ts",
    BrowserBg: "../browser/browser.bg"
};