"use strict";

const Msg = {

    AuthUser    : "auth:user",
    AuthToken   : "auth:token",
    AuthIframe  : "auth:iframe",
    AuthStateGet: "auth:state:get",
    AuthState   : "auth:state",
    AuthOauth   : "auth:oauth",
    AuthLogin   : "auth:login",

    BuddiesData       : "buddies:data",
    BuddiesDataGet    : "buddies:data:get",
    BuddiesWatchToggle: "buddies:watch:toggle",

    ChatData       : "chat:data",
    ChatDataGet    : "chat:data:get",
    ChatMessageRead: "chat:message:read",

    FeedbacksData       : "feedbacks:data",
    FeedbacksDataGet    : "feedbacks:data:get",
    FeedbacksUnsubscribe: "feedbacks:unsubscribe",

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

export default Msg;