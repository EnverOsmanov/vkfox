"use strict";


export function docViewPath() {
    const DOC_VIEW_URL = 'http://vkfox.io/doc/',
        IMAGE_VIEW_URL = 'http://vkfox.io/photo/';

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

export function imageViewPath() {
    const IMAGE_VIEW_URL = 'http://vkfox.io/photo/';

    return function (photo) {
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
    };
}