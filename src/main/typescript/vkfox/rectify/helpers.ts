"use strict";

import RectifyPu from "./rectify.pu";

function html2textBasic(html: string): string {
    const tag = document.createElement('div');
    tag.innerHTML = html;

    return tag.innerText;
}

export function html2text(html: string): string {
    const replacedUsers = RectifyPu.linkifySanitizeEmoji(html, false)

    return html2textBasic(replacedUsers)
}

