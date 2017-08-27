"use strict";
import I18N from '../i18n/i18n.pu';
import * as linkifyHtml from 'linkifyjs/html';
import * as sanitizeHtml from "sanitize-html";
import * as jEmoji from 'emoji';
import * as $ from "jquery";


export function rectifyPu() {
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
     * Sanitize html with Angular's $sanitize.
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
        const jEmojedText = hasEmoji
            ? jEmoji.unifiedToHTML(text)
            : text;

        const sanitized = sanitizeHtml(jEmojedText, {
            allowedTags: [ "br" ]
        });
        const linkifiedText = linkifyHtml(sanitized, {
                //"text" and "href" are safe tokens of the already sanitized string,
                //which is passed to the "linkify" function above
                callback: (text, href) => href ? '<a data-anchor="' + href + '">' + text + '</a>' : text
            });

        //replace wiki layout,
        //linkifiedText is a sanitized and linkified text
        return linkifiedText.replace(
            /\[((?:id|club)\d+)(?::bp-\d+_\d+)?\|([^\]]+)\]/g,
            '<a data-anchor="http://vk.com/$1">$2</a>'
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
    return function (text: string, hasEmoji: boolean) {

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

                    return resultText + resultButton;
                }
                else return linkifySanitizeEmoji(text, hasEmoji);
            }
            else return linkifySanitizeEmoji(text, hasEmoji);
        }
    };
}
