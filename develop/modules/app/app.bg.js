"use strict";
const track = require('../tracker/tracker.js');
try {
    track.trackPage();
    require('../browser/browser.bg.js');
    require('../auth/auth.bg.js');
    require('../auth-monitor/auth-monitor.bg.js');
    require('../buddies/buddies.bg.js');
    require('../chat/chat.bg.js');
    require('../newsfeed/newsfeed.bg.js');
    require('../feedbacks/feedbacks.bg.js');
    require('../router/router.bg.js');
    require('../likes/likes.bg.js');
    require('../tracker/tracker.js');
    require('../proxy-methods/proxy-methods.js');
    require('../resize/resize.bg.js');
    require('../force-online/force-online.bg.js');
    require('../longpoll/longpoll.bg.js');
    if (!require('../env/env.js').opera) {
        require('../yandex/yandex.bg.js');
    }
} catch (e)  {
    track.error(e.stack);
    throw e;
}
