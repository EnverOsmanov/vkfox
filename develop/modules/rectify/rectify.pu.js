"use strict";
const I18N  = require('../i18n/i18n.pu.js'),
    linkifyHtml = require('linkifyjs/html'),
    jEmoji  = require('emoji');

require('angular').module('app')
    .filter('rectify', function ($sanitize, $sce) {
        const MAX_TEXT_LENGTH = 300,
            TRUNCATE_LENGTH = 200,

        showMoreButtonLabel = I18N.get('more...');

        $('body').on('click', '.show-more', function (e) {
            const jTarget = $(e.currentTarget);

            jTarget.replaceWith(linkifySanitizeEmoji(
                jTarget.data('text'),
                jTarget.data('emoji') === 'yes'
            ));
        });

        /**
         * Sanitize html with angular's $sanitize.
         * Replaces all links with correspndenting anchors,
         * replaces next wiki format: [id12345|Dmitrii],
         * [id12345:bp_234567_1234|Dmitrii]
         * or [club32194285|Читать прoдoлжение..]
         * with <a anchor="http://vk.com/id12345">Dmitrii</a>
         * And repaces emoji unicodes with corrspondenting images
         *
         * @param {String} text
         * @param {Boolean} hasEmoji
         * @returns {String} html
         */
        function linkifySanitizeEmoji(text, hasEmoji) {
            const sanitized = $sanitize(hasEmoji ? jEmoji.unifiedToHTML(text):text),
                linkifiedText = linkifyHtml(sanitized, {
                    //"text" and "href" are safe tokens of the already sanitized string,
                    //which is passed to the "linkify" function above
                    callback: (text, href) => href ? '<a anchor="' + href + '">' + text + '</a>' : text
                });

            //replace wiki layout,
            //linkifiedText is a sanitized and linkified text
            return linkifiedText.replace(
                /\[((?:id|club)\d+)(?::bp-\d+_\d+)?\|([^\]]+)\]/g,
                '<a anchor="http://vk.com/$1">$2</a>'
            );
        }

        function escapeQuotes(string) {
            const entityMap = {
                '"': '&quot;',
                "'": '&#39;'
            };

            return String(string).replace(/["']/g, s => entityMap[s] );
        }
        /**
         * Truncates long text, and add pseudo-link "show-more"
         * Replaces text links and next wiki format: [id12345|Dmitrii]
         * with <a anchor="http://vk.com/id12345">Dmitrii</a>
         * And repaces emoji unicodes with corrspondenting images
         *
         * @param {String} text
         * @param {Boolean} hasEmoji If true, then we need to replace missing unicodes with images
         *
         * @returns {String} html-string
         */
        return function (text, hasEmoji) {

            if (text) {
                text = String(text);
                if (text.length > MAX_TEXT_LENGTH) {
                    const spaceIndex = text.indexOf(' ', TRUNCATE_LENGTH);

                    if (spaceIndex !== -1) {
                        const resultText = linkifySanitizeEmoji(text.slice(0, spaceIndex), hasEmoji);
                        const resultButton = [
                            ' <span class="show-more btn rectify__button" data-text="',
                            escapeQuotes(text.slice(spaceIndex)), '" ',
                            hasEmoji ? 'data-emoji="yes" ':'',
                            'type="button">', showMoreButtonLabel, '</span>'
                        ].join('');

                        return $sce.trustAsHtml(resultText + resultButton);
                    }
                    else return linkifySanitizeEmoji(text, hasEmoji);
                }
                else return linkifySanitizeEmoji(text, hasEmoji);
            }
        };
    });
