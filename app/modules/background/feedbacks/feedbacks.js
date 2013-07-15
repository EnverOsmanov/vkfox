angular.module(
    'feedbacks',
    ['mediator', 'request', 'likes', 'profiles-collection']
).run(function (Request, Mediator, ProfilesCollection) {
    var
    MAX_ITEMS_COUNT = 50,
    UPDATE_PERIOD = 1000,

    readyDeferred = jQuery.Deferred(),
    profilesColl = new (ProfilesCollection.extend({
        model: Backbone.Model.extend({
            parse: function (profile) {
                if (profile.gid) {
                    profile.id = -profile.gid;
                } else {
                    profile.id = profile.uid;
                }
                return profile;
            }
        })
    }))(),
    FeedbacksCollection = Backbone.Collection.extend({
        comparator: function (model) {
            return model.get('date');
        }
    }),
    itemsColl = new (Backbone.Collection.extend({
        comparator: function (model) {
            return -model.get('date');
        }
    }))(),
    autoUpdateNotificationsParams = {
        count: MAX_ITEMS_COUNT,
        //everything except comments
        filters: "'wall', 'mentions', 'likes', 'reposts', 'followers', 'friends'"
    },
    autoUpdateCommentsParams = {
        last_comments: 1,
        count: MAX_ITEMS_COUNT
    },
    /**
     * Notifies about current state of module.
     * Has a tiny debounce to make only one publish per event loop
     */
    publishData = _.debounce(function publishData() {
        Mediator.pub('feedbacks:data', {
            profiles: profilesColl.toJSON(),
            items: itemsColl.toJSON()
        });
    }, 0);


    /**
     * Processes raw comments item and adds it to itemsColl,
     * doesn't sort itemsColl
     *
     * @param {Object} item
     */
    function addRawCommentsItem(item) {
        var parentType = item.type,
            parent = item, itemModel, itemID;

        parent.owner_id = Number(parent.from_id || parent.source_id);
        itemID  = generateItemID(parentType, parent);
        if (!(itemModel = itemsColl.get(itemID))) {
            itemModel = createItemModel(parentType, parent, true);
            itemsColl.add(itemModel, {sort: false});
        }
        if (!itemModel.has('date') || itemModel.get('date') < item.date) {
            itemModel.set('date', _.last(item.comments.list).date);
        }
        itemModel.get('feedbacks').add(item.comments.list.map(function (feedback) {
            feedback.owner_id = Number(feedback.from_id);
            return {
                id: generateItemID('comment', feedback),
                type: 'comment',
                feedback: feedback,
                date: feedback.date
            };
        }));
    }
    /**
     * Handles news' item.
     * If parent is already in collection,
     * then adds feedback to parent's feedbacks collection.
     * Doesn't sort itemsColl
     *
     * @param {Object} item
     */
    function addRawNotificationsItem(item) {
        var parentType, parent = item.parent,
            feedbackType, feedback = item.feedback,
            itemID, itemModel, typeTokens;

        if (item.type.indexOf('_') !== -1) {
            typeTokens = item.type.split('_');
            feedbackType = typeTokens[0];
            parentType = typeTokens[1];
        } else {
            parentType = item.type;
        }


        if (feedbackType) {
            parent.owner_id = Number(parent.from_id || parent.owner_id);
            itemID  = generateItemID(parentType, parent);
            if (!(itemModel = itemsColl.get(itemID))) {
                itemModel = createItemModel(parentType, parent, true);
                itemsColl.add(itemModel, {sort: false});
            }
            if (!itemModel.has('date') || itemModel.get('date') < item.date) {
                itemModel.set('date', item.date);
            }
            itemModel.get('feedbacks').add([].concat(feedback).map(function (feedback) {
                feedback.owner_id = Number(feedback.from_id || feedback.owner_id);
                return {
                    id: generateItemID(feedbackType, feedback),
                    type: feedbackType,
                    feedback: feedback,
                    date: item.date
                };
            }));
        } else {
            //follows types are array
            [].concat(feedback).forEach(function (feedback) {
                var itemModel;
                feedback.owner_id = Number(feedback.owner_id || feedback.from_id);
                itemModel = createItemModel(parentType, feedback, false);
                itemModel.set('date', item.date);
                itemsColl.add(itemModel);
            });
        }
    }
    /**
     * Generates uniq id for feedback item
     *
     * @param {String} type of parent: post, comments, topic etc
     * @param {Object} parent
     *
     * @return {String}
     */
    function generateItemID(type, parent) {
        if (parent.owner_id) {
            return [
                type, parent.id || parent.pid || parent.cid || parent.post_id,
                'user', parent.owner_id
            ].join(':');
        } else {
            return _.uniqueId(type);
        }
    }
    /**
     * Creates feedbacks item
     *
     * @param {String} type Type of parent: post, wall, topic, photo etc
     * @param {Object} parent
     * @param {Boolean} canHaveFeedbacks
     *
     * @return {Object}
     */
    function createItemModel(type, parent, canHaveFeedbacks) {
        var itemModel = new Backbone.Model({
            id: generateItemID(type, parent),
            parent: parent,
            type: type
        });
        if (canHaveFeedbacks) {
            // TODO implement sorting
            itemModel.set('feedbacks', new FeedbacksCollection());
        }
        return itemModel;
    }

    function fetchFeedbacks() {
        Request.api({code: [
            'return {time: API.utils.getServerTime(),',
            ' notifications: API.notifications.get(',
            JSON.stringify(autoUpdateNotificationsParams), '),',
            ' comments: API.newsfeed.getComments(',
            JSON.stringify(autoUpdateCommentsParams), ')',
            '};'
        ].join('')}).done(function (response) {
            var notifications = response.notifications,
                comments = response.comments;

            autoUpdateNotificationsParams.start_time = response.time;
            autoUpdateNotificationsParams.from = notifications.new_from;
            autoUpdateCommentsParams.start_time = response.time;
            autoUpdateCommentsParams.from = comments.new_from;

            // first item in notifications contains quantity
            if ((notifications.items && notifications.length > 1)
                || (comments.items && comments.items.length)) {
                // TODO comments
                profilesColl
                    .add(comments.profiles, {parse: true})
                    .add(comments.groups, {parse: true})
                    .add(notifications.profiles, {parse: true})
                    .add(notifications.groups, {parse: true});

                notifications.items.slice(1).forEach(addRawNotificationsItem);
                comments.items.forEach(addRawCommentsItem);
                itemsColl.sort();
                console.log(response);
            }
            readyDeferred.resolve();
            setTimeout(fetchFeedbacks, UPDATE_PERIOD);
        });
    }

    fetchFeedbacks();

    readyDeferred.then(function () {
        Mediator.sub('likes:changed', function (params) {
            itemsColl.some(function (model) {
                var parent  = model.get('parent'),
                    matches = false;

                matches = (parent.to_id === params.owner_id)
                    && (params.type === parent.post_type  || params.type === model.get('type'))
                    && (parent.id === params.item_id);

                if (matches) {
                    parent.likes = params.likes;
                    itemsColl.trigger('change');
                }
            });
        });
    });

    Mediator.sub('feedbacks:data:get', function () {
        readyDeferred.then(publishData);
    });

    // Notify about changes
    readyDeferred.then(function () {
        itemsColl.on('change sort', publishData);
        profilesColl.on('change', publishData);
    });
});