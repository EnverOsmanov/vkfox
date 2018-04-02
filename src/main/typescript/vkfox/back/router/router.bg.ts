"use strict";

import Mediator from "../../mediator/mediator.bg"
import PersistentModel from "../../persistent-model/persistent-model"
import Msg from "../../mediator/messages";


const model = new PersistentModel(
    {lastPath: "chat"},
    {name: "router"}
);


export default {
    init: () => {
        Mediator.sub(Msg.RouterLastPathPut, (lastPath: string) => model.set("lastPath", lastPath));
    },

    /**
     * Returns true if an active tab in a popup is a feedbacks tab
     *
     * @returns {Boolean}
     */
    isFeedbackTabActive: () => model.get("lastPath").indexOf("my") !== -1,
    /**
     * Returns true if an active tab in a popup is a chat tab
     *
     * @returns {Boolean}
     */
    isChatTabActive(): boolean {
        return model.get("lastPath").indexOf("chat") !== -1
    }
};
