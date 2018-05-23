"use strict";
import * as $ from "jquery"
(<any>window).jQuery = $;
import "bootstrap/js/dist/tooltip.js";
import {TooltipOption, Delay, Placement} from "bootstrap"

export default function init() {

    const options: TooltipOption = {
        delay,
        placement,
        selector: '[title]'
    };

    $(() =>
        $("[data-toggle='tooltip']").tooltip(options)
    );

// Hide popup on click
    $(document).on('show', '[title]', function (e) {
        $(e.target).one('click', function () {
            $(this).data('tooltip').$tip.remove();
        });
    });
}

function placement(tooltip): Placement {
    setTimeout(() => {
        const $tooltip = $(tooltip),
            $inner = $('.tooltip-inner', tooltip);

        //if no item, then will return outerWidth of root
        const offset = $tooltip.parents('.item').add((<any>window)).width()
            - $tooltip.offset().left - $tooltip.width();

        if (offset < 0) {
            $inner.css({
                'position': 'relative',
                'left': offset + 'px'
            });
        }
    });

    return 'bottom';
}

const delay: Delay = {
    show: 1000,
    hide: 0
};
