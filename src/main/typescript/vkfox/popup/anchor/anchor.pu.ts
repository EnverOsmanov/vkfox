"use strict";
import * as $ from "jquery";
import Browser from '../../browser/browser.pu';

export default function init() {
    $(document).on('click', '[data-anchor]', (e) => {
        const jTarget = $(e.currentTarget);

        Browser.createTab(jTarget.attr('data-anchor'));
    })
};
