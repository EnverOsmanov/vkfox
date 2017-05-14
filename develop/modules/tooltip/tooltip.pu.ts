"use strict";
import * as $ from "jquery"
(<any>window).jQuery = $;
import 'bootstrapTooltip';

export default function init() {
    $(document).ready(() =>
        $("[data-toggle='tooltip']").tooltip({
            selector: '[title]',
            delay: {show: 1000, hide: false},
            placement: function (tooltip) {
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
        })
    );

// Hide popup on click
    $(document).on('show', '[title]', function (e) {
        $(e.target).one('click', function () {
            $(this).data('tooltip').$tip.remove();
        });
    });
}
