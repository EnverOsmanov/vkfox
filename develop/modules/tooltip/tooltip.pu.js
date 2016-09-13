"use strict";
require('zepto');
require('zepto/selector');
require('zepto/data');
require('zepto/detect');
require('zepto/event');
window.jQuery = window.$;
jQuery.offset = jQuery.fn.offset;

require('bootstrapTooltip');

$(document).tooltip({
    selector : '[title]',
    delay    : { show: 1000, hide: false},
    placement: function (tooltip) {
        setTimeout(function () {
            const $tooltip = $(tooltip),
                $inner     = $('.tooltip-inner', tooltip);

            //if no item, then will return outerWidth of root
            const offset = $tooltip.parents('.item').add(window).width()
                    - $tooltip.offset().left - $tooltip.width();

            if (offset < 0) {
                $inner.css({
                    'position': 'relative',
                    'left':  offset + 'px'
                });
            }
        });
        return 'bottom';
    }
});

// Hide popup on click
$(document).on('show', '[title]', function (e) {
    $(e.target).one('click', function () {
        $(this).data('tooltip').$tip.remove();
    });
});

