"use strict";
import * as linkifyHtml from 'linkifyjs/html';
import * as sanitizeHtml from "sanitize-html";
import * as jEmoji from 'emoji';

export function html2textBasic(html: string): string {
    const tag = document.createElement('div');
    tag.innerHTML = html;

    return tag.innerText;
}

export function html2text(html: string, createTab: (h: string, t: string) => string): string {
    const replacedUsers = linkifySanitizeEmoji(html, false, createTab)

    return html2textBasic(replacedUsers)
}

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
 * @param createTab
 * @returns {String} html
 */
export function linkifySanitizeEmoji(text, hasEmoji, createTab: (h: string, t: string) => string): string {
    const jEmojedText = hasEmoji
        ? jEmoji.unifiedToHTML(text)
        : text;

    const sanitized = sanitizeHtml(jEmojedText, {
        parser: {},
        allowedTags: [ "br" ]
    });
    const linkifiedText: string = linkifyHtml(sanitized, {
        //"text" and "href" are safe tokens of the already sanitized string,
        //which is passed to the "linkify" function above
        callback: (text, href) => href
            ? createTab(href, text)
            : text
});

    //replace wiki layout,
    //linkifiedText is a sanitized and linkified text
    return linkifiedText.replace(
        /\[((?:id|club)\d+)(?::bp-\d+_\d+)?\|([^\]]+)\]/g,
        '<a data-anchor="https://vk.com/$1">$2</a>'
    );
}