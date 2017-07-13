"use strict";
import * as $ from "jquery";
import Browser from '../browser/browser.pu';

export default function init() {
    $(document).on('click', '[anchor]', function (e) {
        const jTarget = $(e.currentTarget);

        Browser.createTab(jTarget.attr('anchor'));
    })
};
