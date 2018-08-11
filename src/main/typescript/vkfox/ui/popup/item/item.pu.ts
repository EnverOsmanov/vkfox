"use strict";

import {AttachmentDoc, AttachmentPhoto, AttachmentSticker} from "../../../../vk/types/newsfeed";
import {ProfileI} from "../../../back/users/types";


const VIDEO_VIEW_URL = "/pages/video.html";
const DOC_VIEW_URL = "/pages/doc.html",
    IMAGE_VIEW_URL = "/pages/photo.html";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "bmp", "gif", "tiff"];

const photoSizes = [
    "photo_807",
    "photo_604",
    "photo_130",
    "photo_75",
    "photo"
];

const profilePhotoSizes = [
    "photo_50",
    "photo_100",
    "photo_200",
    "photo"
];

export function docViewPath(data: AttachmentDoc): string {

    function isImage(filename: string) {
        const match        = filename.match(/\.([^.]+)$/);

        if (match) {
            return ~IMAGE_EXTS.indexOf(match[1].toLowerCase());
        }
    }

    if (data) {
        const url = isImage(data.title)
            ? IMAGE_VIEW_URL
            : DOC_VIEW_URL;

        return `${url}#${btoa(data.url)}`;
    }
}

export function imageViewPathByUrl(url: string): string {

    return `${IMAGE_VIEW_URL}#${btoa(url)}`;
}

export function videoViewPathByUrl(url: string): string {

    return `${VIDEO_VIEW_URL}#${btoa(url)}`;
}

export function imageViewPath(photo: AttachmentPhoto): string | null {

    if (photo) {
        for (const i in photoSizes) {
            if (photoSizes[i] in photo) {
                return `${IMAGE_VIEW_URL}#${btoa(photo[photoSizes[i]])}`;
            }
        }
    }
}

export function profilePhotoPath(photo: ProfileI): string | void {

    if (photo) {
        for (const i in profilePhotoSizes) {
            if (profilePhotoSizes[i] in photo) {
                return photo[profilePhotoSizes[i]];
            }
        }
    }
}

export function stickerViewPath(photo: AttachmentSticker): string {

    return `${IMAGE_VIEW_URL}#${btoa(stickerImageUrl(photo))}`;
}

export function stickerImageUrl(sticker: AttachmentSticker): string {
    const maybeImage = sticker.images_with_background
        .sort((a, b) => b.height - a.height)[0];

    return maybeImage
        ? maybeImage.url
        : ""
}

export function buildSrcSet(photo: AttachmentPhoto): string {
    const arr: string[] = [];

    if (photo.photo_75) arr.push(`${photo.photo_75} 75w`);
    if (photo.photo_130) arr.push(`${photo.photo_130} 130w`);
    if (photo.photo_604) arr.push(`${photo.photo_604} 604w`);
    if (photo.photo_807) arr.push(`${photo.photo_807} 807w`);
    if (photo.photo_1280) arr.push(`${photo.photo_1280} 1280w`);
    if (photo.photo_2560) arr.push(`${photo.photo_2560} 2560w`);

    return arr.toString();
}