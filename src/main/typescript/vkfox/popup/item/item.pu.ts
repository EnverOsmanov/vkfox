"use strict";

import {AttachmentDoc, AttachmentPhoto, AttachmentSticker} from "../../../vk/types/newsfeed";
import {ProfileI} from "../../back/users/types";

const DOC_VIEW_URL = "/pages/doc.html",
    IMAGE_VIEW_URL = "/pages/photo.html";

export function docViewPath(data: AttachmentDoc): string {

    function isImage(filename: string) {
        const IMAGE_EXTS = ["jpg", "jpeg", "png", "bmp", "gif", "tiff"],
            match        = filename.match(/\.([^.]+)$/);

        if (match) {
            return ~IMAGE_EXTS.indexOf(match[1].toLowerCase());
        }
    }

    if (data) {
        return (isImage(data.title) ? IMAGE_VIEW_URL:DOC_VIEW_URL) + "#" + btoa(data.url);
    }
}

export function imageViewPath(photo: AttachmentPhoto): string | void {
    const sizes = [
        "photo_807",
        "photo_604",
        "photo_130",
        "photo_75",
        "photo"
    ];

    let i;
    if (photo) {
        for (i in sizes) {
            if (sizes[i] in photo) {
                return IMAGE_VIEW_URL + "#" + btoa(photo[sizes[i]]);
            }
        }
    }
}

export function profilePhotoPath(photo: ProfileI): string | void {
    const sizes = [
        "photo_50",
        "photo_100",
        "photo_200",
        "photo"
    ];

    let i;
    if (photo) {
        for (i in sizes) {
            if (sizes[i] in photo) {
                return photo[sizes[i]];
            }
        }
    }
}

export function stickerViewPath(photo: AttachmentSticker) {

    return IMAGE_VIEW_URL + "#" + btoa(stickerImageUrl(photo));
}

export function stickerImageUrl(sticker: AttachmentSticker): string {
    const maybeImage = sticker.images_with_background
        .sort(p => p.height)[0];

    return maybeImage
        ? maybeImage.url
        : ""
}