"use strict";
import * as _ from "lodash"

import * as $ from "jquery"


const HEADER_HEIGHT = 50;

export function itemListFixedH(element) {

    const element$      = $("#fixed-header"),
        listTop         = element$.offset().top,
        contentElement$ = element$.find('.item-list__content'),
        SCROLLBAR_WIDTH = contentElement$.width() - contentElement$.find('.item-list__scroll').width();

    let lastTopVisibleElement;

    $('<style>.item_fixed_window .item__header,'
        + ' .item_fixed_window .item__actions { right: '
        + SCROLLBAR_WIDTH + 'px;}</style>').appendTo('head');

    contentElement$.scroll( _.debounce(function () {
        const topVisibleElement = document.elementFromPoint(0, listTop),
            topVisibleElement$ = $(topVisibleElement);

        if (!topVisibleElement$.hasClass('item')) return;

        const itemBottom = topVisibleElement$.offset().top + topVisibleElement$.height();

        if (topVisibleElement !== lastTopVisibleElement) {

            if (lastTopVisibleElement) lastTopVisibleElement.className = 'item';

            lastTopVisibleElement = topVisibleElement;
        }
        if (itemBottom - listTop > HEADER_HEIGHT)
            topVisibleElement.className = 'item item_fixed_window';
        else if (itemBottom - listTop > 0)
            topVisibleElement.className = 'item item_fixed_bottom';
        else
            topVisibleElement.className = 'item';
    }, 10));
}
