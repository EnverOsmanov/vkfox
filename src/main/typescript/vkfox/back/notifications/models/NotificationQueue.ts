import * as Backbone from "backbone";
import Notifications from "../notifications.bg";
import Mediator from "../../../mediator/mediator.bg";
import {Msg} from "../../../mediator/messages";
import {Message} from "../../../../vk/types";
import {NotifType, VKNotification} from "../VKNotification";


export class NotificationQueue extends Backbone.Collection<VKNotification> {
    model = VKNotification;

    initialize() {
        const self = this;

        self.on('add remove reset', () => {
            Notifications.setBadge(
                self.filter(model => !model.noBadge)
                    .length
            );
        })
            .on('add', (model: VKNotification) => {
                if (!model.get('noPopup')) Notifications.createPopup(model.toJSON());

                if (!model.get('noSound')) Notifications.playSound(model.toJSON());
            });

        Mediator.sub(Msg.AuthUser, () => self.reset());

        // Remove seen updates
        Mediator.sub(Msg.RouterChange, (tab: string) => {
            const type = tab.substr(1);

            if (tab && self.size()) {
                self.remove(self.where({type}));
            }
        });

        // remove notifications about read messages
        Mediator.sub(Msg.ChatMessageRead, (message: Message) => {
            if (!message.out) {
                self.remove(self.findWhere({type: NotifType.CHAT}));
            }
        });

        Mediator.sub(Msg.NotificationsQueueGet, () => {
            Mediator.pub(Msg.NotificationsQueue, self.toJSON())
        });
    }
}