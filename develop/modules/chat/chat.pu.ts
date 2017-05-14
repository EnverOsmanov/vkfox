"use strict";
import * as $ from "jquery";
import Request from "../request/request.pu";
import * as _ from "underscore";
import * as Vow from "vow";
import * as Angular from "angular";
import Mediator from "../mediator/mediator.pu";
import Users from "../users/users.pu";
import Msg from "../mediator/messages";
import {Profile, ProfilesColl} from "./collections/ProfilesColl";
import {Message} from "./collections/DialogColl";
import {Collection} from "backbone";



function ChatFactory() {
    return {
        /**
         * Fold adjoint messages with a common author into a group
         * and return all such groups
         *
         * @param {Array} messages
         * @param {Array} profiles
         *
         * @returns {Array}
         */
        foldMessagesByAuthor: function (messages, profilesColl) {
            const selfProfile = profilesColl.findWhere({isSelf: true}).toJSON();

            return messages.reduce(function (memo, message) {
                const lastItem = memo[memo.length - 1],
                    author = message.out ? selfProfile : profilesColl.get(message.uid).toJSON();

                if (lastItem && (author.uid === lastItem.author.uid)) {
                    lastItem.items.push(message);
                } else {
                    memo.push({
                        items : [message],
                        out   : author === selfProfile,
                        author: author
                    });
                }

                return memo;
            }, []);
        },
        /**
         * Mark messages as read
         *
         * @param {Array} messages
         */
        markAsRead: function (messages) {
            const code = `return API.messages.markAsRead({mids: [${_.pluck(messages, 'mid') }]});`;

            Request.api({ code });
        },
        getHistory: function (dialog: Message, offset: number) {
            const params: any = {
                offset,
                count: 5
            };
            if (dialog.chat_active) params.chat_id = dialog.chat_id;
            else params.user_id = dialog.uid;

            return Request.api({
                code: 'return  API.messages.getHistory(' + JSON.stringify(params) + ');'
            }).then(function (messages) {
                if (dialog.chat_active) {
                    //after fetching of news profiles,
                    //we must make sure that we have
                    //required profile objects
                    return Users.getProfilesById(
                        messages
                            .slice(1)
                            .map( message => message.uid)
                    ).then( profiles => ({ messages, profiles }));
                }
                else return Vow.resolve({messages: messages, profiles: []});
            });
        }
    };
}

function ChatCtrl($scope) {
    Mediator.pub(Msg.ChatDataGet);

    Mediator.sub(Msg.ChatData, function (data) {
        $scope.$apply(function () {
            $scope.dialogs = data.dialogs;
            $scope.profilesColl = new Collection<Profile>(data.profiles, { model: Profile });
        });
    });
    $scope.$on('$destroy', function () {
        Mediator.unsub(Msg.ChatData);
    });
}

function ChatItemCtrl($scope, $Chat) {
    const dialog: Message = $scope.dialog,
        profilesColl: ProfilesColl = $scope.profilesColl;

    let online;

    if (dialog.chat_id) {
        $scope.owners = dialog.chat_active.map( (uid: number) => {
            return profilesColl.get(uid).toJSON();
        });
    } else {
        $scope.owners = profilesColl.get(dialog.uid).toJSON();

        $scope.$watch( () => {
                online = $scope.profilesColl
                    .get(dialog.uid)
                    .get('online');

                return online;
            }
            , () => $scope.owners.online = online
        );
    }

    $scope.$watch(function ($scope) {
        const message = _($scope.dialog.messages).last();
        return [
            $scope.dialog.messages.length,
            message.mid,
            message.read_state
        ].join();
    }, function () {
        const dialog = $scope.dialog;
        $scope.foldedMessages = $Chat.foldMessagesByAuthor(dialog.messages, $scope.profilesColl);
        $scope.out = _($scope.foldedMessages).last().author.isSelf;
        $scope.unread = _(dialog.messages).last().read_state === 0;
    });
}

function ChatActionsCtrl($scope, $Chat) {
    $scope.showHistory = function (dialog) {
        $Chat
            .getHistory(dialog, dialog.messages.length)
            .then( ({messages, profiles}) => {
            $scope.profilesColl.add(profiles);
            $scope.$apply( () => {
                // TODO else hide button - show history
                if (messages.length > 1) {
                    //remove first item, which contains count
                    messages.shift();
                    [].unshift.apply(dialog.messages, messages.reverse());
                }
            });
        });
    };
    $scope.unreadHandler = function (event) {
        if ($scope.out) {
            //show tooltip
            $(event.currentTarget).data('tooltip').toggle();
        } else {
            $Chat.markAsRead($scope.dialog.messages);
            $(event.currentTarget).data('tooltip').hide();
        }
    };
}

export default function init() {

    Angular.module('app')
        .factory('$Chat', ChatFactory)
        .controller('ChatCtrl', ChatCtrl)
        .controller('ChatItemCtrl', ChatItemCtrl)
        .controller('ChatActionsCtrl', ChatActionsCtrl);
}
