"use strict";
const _              = require('../shim/underscore.js')._,
  Vow                = require('../shim/vow.js'),
  Backbone           = require('backbone'),
  Request            = require('../request/request.bg.js'),
  Mediator           = require('../mediator/mediator.js'),
  Users              = require('../users/users.bg.js'),
  Router             = require('../router/router.bg.js'),
  Browser            = require('../browser/browser.bg.js'),
  I18N               = require('../i18n/i18n.js'),
  Notifications      = require('../notifications/notifications.bg.js'),
  PersistentModel    = require('../persistent-model/persistent-model.js'),
  ProfilesCollection = require('../profiles-collection/profiles-collection.bg.js'),
  Msg                = require("../mediator/messages.js");

const MAX_HISTORY_COUNT = 10;

let persistentModel, userId,
    readyPromise = Vow.promise();

const dialogColl = new (Backbone.Collection.extend({
    comparator: dialog => {
        const messages = dialog.get('messages');
        return - messages[messages.length - 1].date;
    }
}))();

const profilesColl = new (ProfilesCollection.extend({
    model: Backbone.Model.extend({
        idAttribute: 'uid'
    })
}))();

/**
 * Notifies about current state of module.
 * Has a tiny debounce to make only one publish per event loop
 */
const publishData = _.debounce( () => {

    Mediator.pub(Msg.ChatData, {
        dialogs: dialogColl.toJSON(),
        profiles: profilesColl.toJSON()
    });
}, 0);

readyPromise.then(function () {
    function notifyAboutChange() {
        dialogColl.sort();
        updateLatestMessageId();
        publishData();
    }

    Mediator.sub(Msg.LongpollUpdates, onUpdates);

    // Notify about changes
    dialogColl.on("change", notifyAboutChange);
    profilesColl.on('change', publishData);
}).done();

Mediator.sub(Msg.AuthSuccess, data => {
    initialize();

    userId = data.userId;
    getDialogs()
      .then(getUnreadMessages)
      .then(fetchProfiles)
      .then( () => readyPromise.fulfill() )
      .done();
});

Mediator.sub(Msg.ChatDataGet, () => readyPromise.then(publishData).done() );


//functions
/**
 * Updates "latestMessageId" with current last message
 * Should be called on every incoming message
 */
function updateLatestMessageId() {

    if (dialogColl.size()) {
        const messages = dialogColl.first().get('messages');

        persistentModel.set(
            'latestMessageId',
            messages[messages.length - 1].mid
        );
    }
}

function fetchProfiles() {
    function dialog2Uuids(uids, dialog) {
        uids = uids
            .concat(dialog.get('messages').map(message => message.uid), dialog.get('uid'))
            .filter(uid => uid > 0);

        if (dialog.get('chat_active')) return uids.concat(dialog.get('chat_active'));
        else return uids;
    }

    function addProfile(data) {
        profilesColl.add(data);
        profilesColl.get(userId).set('isSelf', true);
    }

    const requiredUids = dialogColl.reduce(dialog2Uuids, [userId]);
    const cachesUids = profilesColl.pluck('uid');
    const missingUids = _
        .chain(requiredUids)
        .uniq()
        .difference(cachesUids)
        .value();

    profilesColl.remove(_(cachesUids).difference(requiredUids));

    if (missingUids.length) return Users.getProfilesById(missingUids).then(addProfile);
    else return Vow.fulfill();
}

/**
 * Initialize all internal state
 */
function initialize() {
    dialogColl.reset();
    profilesColl.reset();

    if (!readyPromise || readyPromise.isFulfilled()) {
        if (readyPromise) {
            readyPromise.reject();
        }
        readyPromise = Vow.promise();
    }
    readyPromise.then(function () {
        persistentModel = new PersistentModel({}, {
            name: ['chat', 'background', userId].join(':')
        });

        persistentModel.on('change:latestMessageId', function () {
            const messages = dialogColl.first().get('messages'),
              message = messages[messages.length - 1];

            // don't notify on first run,
            // when there is no previous value
            if (!this._previousAttributes.hasOwnProperty('latestMessageId')) {
                return;
            }

            if (!message.out) {
                // Don't notify, when active tab is vk.com
                Browser.isVKSiteActive().then(function (active) {
                    if (!active) {
                        fetchProfiles().then(function () {
                            const profile = profilesColl.get(message.uid).toJSON(),
                              gender = profile.sex === 1 ? 'female' : 'male',
                              chatActive = Browser.isPopupOpened() && Router.isChatTabActive();

                            Notifications.notify({
                                type: Notifications.CHAT,
                                title: I18N.get('sent a message', {
                                    NAME: Users.getName(profile),
                                    GENDER: gender
                                }),
                                message: message.body,
                                image: profile.photo,
                                noBadge: chatActive,
                                noPopup: chatActive
                            });
                        });
                    }
                });
            }
        });
        updateLatestMessageId();
        publishData();
    }).done();
}

/**
 * Removes read messages from dialog,
 * leaves only first one or unread in sequence
 *
 * @param {Backbone.Model} dialog subject for mutation
 */
function removeReadMessages(dialog) {
    const messages = dialog.get('messages'),
      result = [messages.pop()],
      originalOut = result[0].out;

    messages.reverse().some(function (message) {
        if (message.out === originalOut && message.read_state === 0) {
            result.unshift(message);
        }
        // stop copying messages
        else return true;
    });
    dialog.set({'messages': result}, {silent: true});
}

function getDialogs() {
    return Request.api({
        code: 'return API.messages.getDialogs({preview_length: 0});'
    }).then(function (response) {
        if (response && response[0]) {
            dialogColl.reset(
              response
                .slice(1)
                .filter( item => item.uid > 0)
                .map( item => { return {
                    id: item.chat_id ? 'chat_id_' + item.chat_id:'uid_' + item.uid,
                    chat_id: item.chat_id,
                    chat_active: item.chat_active,
                    uid: item.uid,
                    messages: [item]
                };})
            );
        }
    });
}

function onUpdates(updates) {

    updates.forEach(function (update) {
        let messageId, mask, readState;

        // @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server
        switch (update[0]) {
            // reset message flags (FLAGS&=~$mask)
            case 3:
                messageId = update[1];
                mask = update[2];
                readState = mask & 1;
                if (messageId && mask && readState) {
                    dialogColl.some(function (dialog) {
                        return dialog.get('messages').some(function (message) {
                            if (message.mid === messageId) {
                                message.read_state = readState;
                                removeReadMessages(dialog);
                                if (readState) {
                                    Mediator.pub(Msg.ChatMessageReed, message);
                                }
                                dialogColl.trigger('change');
                                return true;
                            }
                        });
                    });
                }
                break;
            case 4:
                addNewMessage(update);
                break;
        }
    });
}

/**
 * If last message in dialog is unread,
 * fetch dialog history and get last unread messages in a row
 */
function getUnreadMessages() {
    function getHistory(dialog) {
        const code = "return API.messages.getHistory({" +
            `user_id: ${dialog.get('uid')},` +
            `count: ${MAX_HISTORY_COUNT} ` +
            "});";

        return Request.api({code: code});
    }

    // FIXME wtf models.filter?
    const unreadDialogs = dialogColl.models.filter(function (dialog) {
        return !dialog.get('chat_id') && !dialog.get('messages')[0].read_state;
    });

    const unreadHistoryRequests = unreadDialogs.map(getHistory);

    return Vow.all(unreadHistoryRequests).spread(function () {
        _(arguments).each(function (historyMessages, index) {
            if (historyMessages && historyMessages[0]) {
                unreadDialogs[index].set({
                    'messages': historyMessages.slice(1).reverse()
                }, {silent: 'yes'});
                removeReadMessages(unreadDialogs[index]);
            }
        });
    });
}


/**
 * @param {Object} update Update object from long poll
 */
function addNewMessage(update) {
    const messageId      = update[1],
      flags              = update[2],
      attachment         = update[7],
      dialogCompanionUid = update[3];

    let messageDeferred;

    // For messages from chat attachment contains "from" property
    if (_(attachment).isEmpty()) {
        // mimic response from server
        messageDeferred = Vow.promise([1, {
            body      : update[6],
            title     : update[5],
            date      : update[4],
            uid       : dialogCompanionUid,
            read_state: +!(flags & 1),
            mid       : messageId,
            out       : +!!(flags & 2)
        }]);
    }
    else {
        const code = `return API.messages.getById({chat_active: 1, mid: ${messageId}});`;
        messageDeferred = Request.api({ code: code});
    }

    messageDeferred.then(function (response) {
        const message = response[1],
          dialogId = message.chat_id ? 'chat_id_' + message.chat_id : 'uid_' + dialogCompanionUid;

        const dialog = dialogColl.get(dialogId);
        if (dialog) {
            dialog.get('messages').push(message);
            removeReadMessages(dialog);
        }
        else dialogColl.add({
            id: dialogId,
            uid: message.uid,
            chat_id: message.chat_id,
            chat_active: message.chat_active,
            messages: [message]
        }, {silent: true});

        return fetchProfiles().then(function () {
            // important to trigger change, when profiles are available
            // because will cause an error, when creating notifications
            dialogColl.trigger('change');
            return message;
        });
    }).done();
}
