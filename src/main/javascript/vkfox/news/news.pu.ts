"use strict";
import * as Config from '../config/config'
import Mediator from '../mediator/mediator.pu'
import Msg from "../mediator/messages"
import * as Angular from "angular"
import {ItemObj} from "../feedbacks/collections/ItemColl";
import {
    PhotoFeedback, PostFeedback, TopicFeedback, VideoFeedback,
    WallPostMentionFeedback
} from "../feedbacks/collections/FeedBacksCollection";


function NewsFactory() {
    return {
        unsubscribe: function (type, ownerId, itemId) {
            const options = {
                type: type,
                owner_id: ownerId,
                item_id: itemId
            };
            Mediator.pub(Msg.FeedbacksUnsubscribe, options);
        },
        /**
         * Returns link to the original item on vk.com
         *
         * @param {Object} item
         * @returns {String}
         */
        getSourceLink: function (item) {
            const parent = item.parent;

            switch (item.type) {
                case 'wall':
                case 'post':
                    // case 'mention':
                    return Config.VK_BASE + 'wall'
                        + (parent.to_id || parent.source_id) + '_'
                        + (parent.post_id || parent.id) + '?offset=last&scroll=1';
                case 'comment':
                    // generate link to parent item
                    return ['post', 'topic', 'photo', 'video']
                        .filter(Object.hasOwnProperty, parent)
                        .map(function (type) {
                            const parentLink = this.getSourceLink({type: type, parent: parent[type]});
                            // replace query params
                            return parentLink.replace(/\?[^?]+$/, '?reply=' + item.parent.id);
                        }, this)[0];
                case 'topic':
                    return Config.VK_BASE + 'topic' + parent.owner_id
                        + '_' + (parent.id || parent.post_id || parent.tid)
                        + '?offset=last&scroll=1';
                case 'photo':
                    return Config.VK_BASE + 'photo' + parent.owner_id
                        + '_' + (parent.id || parent.pid);
                case 'video':
                    return Config.VK_BASE + 'video' + parent.owner_id
                        + '_' + (parent.id || parent.vid);
            }
        },
        getCommentsData: function (item: ItemObj) {
            const { parent } = item;

            switch (item.type) {
                case 'wall':
                case 'post':
                case 'mention':
                    const wpmParent = <WallPostMentionFeedback>parent;
                    if (wpmParent.comments.can_post) {
                        return {
                            ownerId: wpmParent.source_id || wpmParent.owner_id,
                            id     : wpmParent.id || wpmParent.post_id,
                            type   : 'post'
                        };
                    }
                    break;
                case 'comment':
                    const cmmntParent = <PostFeedback>parent;
                    if (cmmntParent.post && cmmntParent.post.comments.can_post) {
                        return {
                            ownerId: cmmntParent.post.from_id,
                            id     : cmmntParent.post.id,
                            replyTo: cmmntParent.id,
                            type   : 'post'
                        };
                    }
                    else if (cmmntParent.topic && !cmmntParent.topic.is_closed) {
                        return this.getCommentsData({
                            type: 'topic',
                            parent: cmmntParent.topic
                        });
                    }
                    else {
                        return ['photo', 'video']
                            .filter(Object.hasOwnProperty, parent)
                            .map(function (type) {
                                return this.getSourceLink({type: type, parent: parent[type]});
                            }, this)[0];
                    }
                case 'topic':
                    const topicParent = <TopicFeedback>parent;
                    return {
                        ownerId: topicParent.owner_id,
                        id     : topicParent.id || topicParent.tid || topicParent.post_id,
                        type   : 'topic'
                    };
                case 'photo':
                    const phParent = <PhotoFeedback>parent;
                    return {
                        ownerId: phParent.owner_id,
                        id     : phParent.id || phParent.pid,
                        type   : 'photo'
                    };
                case 'video':
                    const viParent = <VideoFeedback>parent;
                    return {
                        ownerId: viParent.owner_id,
                        id     : viParent.id || viParent.vid,
                        type   : 'video'
                    };
            }
        }
    };
}

export default function init() {
    Angular.module('app')
        .factory('News', NewsFactory)
        .controller('NewsController', function ($scope, $routeParams) {
            $scope.subtabs = [
                {
                    href: 'news/my',
                    text: 'my'
                },
                {
                    href: 'news/friends',
                    text: 'friends_nominative'
                },
                {
                    href: 'news/groups',
                    text: 'groups_nominative'
                }
            ];
            $scope.activeSubTab = $routeParams.subtab;
        })
        .controller('MyNewsController', function ($scope) {
            Mediator.pub(Msg.FeedbacksDataGet);

            Mediator.sub(Msg.FeedbacksData, data => {
                $scope.$apply( () => $scope.data = data );
            });

            $scope.$on('$destroy', () => Mediator.unsub(Msg.FeedbacksData));
        })
        .controller('MyNewsActionsCtrl', function ($scope, News) {
            $scope.unsubscribe = News.unsubscribe;
            $scope.comment = News.getCommentsData($scope.item);
            $scope.parent = $scope.item.parent;
            $scope.open = News.getSourceLink($scope.item);
        })
        .controller('FriendNewsController', function ($scope) {
            Mediator.pub(Msg.NewsfeedFriendsGet);
            Mediator.sub(Msg.NewsfeedFriends, data => $scope.$apply( () => $scope.data = data ) );
            $scope.$on('$destroy', () => Mediator.unsub(Msg.NewsfeedFriends) );
        })
        .controller('GroupNewsController', function ($scope) {
            Mediator.pub(Msg.NewsfeedGroupsGet);
            Mediator.sub(Msg.NewsfeedGroups, data => $scope.$apply( () => $scope.data = data ) );
            $scope.$on('$destroy', () => Mediator.unsub(Msg.NewsfeedGroups) );
        });
}
