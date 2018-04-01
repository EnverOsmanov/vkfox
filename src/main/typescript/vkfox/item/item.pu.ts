"use strict";

import {AttachmentGraffiti, AttachmentSticker} from "../newsfeed/types";

const DOC_VIEW_URL = 'http://vkfox.io/doc/',
    IMAGE_VIEW_URL = 'http://vkfox.io/photo/';

export function docViewPath() {

    function isImage(filename) {
        const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff'],
            match        = filename.match(/\.([^.]+)$/);

        if (match) {
            return ~IMAGE_EXTS.indexOf(match[1].toLowerCase());
        }
    }

    return function (data) {
        if (data) {
            return (isImage(data.title) ? IMAGE_VIEW_URL:DOC_VIEW_URL) + '#' + btoa(data.url);
        }
    };
}

export function imageViewPath(photo: AttachmentGraffiti): string | void {
    const sizes = [
        'src_xxxbig',
        'src_xxbig',
        'src_xbig',
        'src_big',
        'src_small',
        'src'
    ];

    let i;
    if (photo) {
        for (i in sizes) {
            if (sizes[i] in photo) {
                return IMAGE_VIEW_URL + '#' + btoa(photo[sizes[i]]);
            }
        }
    }
}

export function stickerViewPath(photo: AttachmentSticker) {
    const sizes = [
        "photo_512",
        "photo_352",
        "photo_256",
        "photo_128",
        "photo_64"
    ];

    let i;
    if (photo) {
        for (i in sizes) {
            if (sizes[i] in photo) {
                return IMAGE_VIEW_URL + '#' + btoa(photo[sizes[i]]);
            }
        }
    }
}