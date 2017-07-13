"use strict";
import Mediator from "../mediator/mediator.bg"
import Browser from "../browser/browser.bg"
import YandexMozBg from "./yandex.moz.bg"
import Msg from "../mediator/messages";

export default function init() {
    Mediator.sub(Msg.YandexDialogClose, () => Browser.closeTabs('pages/install.html') );

    YandexMozBg();
}