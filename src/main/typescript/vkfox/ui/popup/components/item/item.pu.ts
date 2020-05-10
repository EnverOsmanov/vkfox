"use strict";

import {AttachmentDoc, AttachmentGift, AttachmentSticker} from "../../../../../vk/types/attachment";
import {ProfileI} from "../../../../common/users/types";
import {media} from "../../../../../vk/types/newsfeed";


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

const giftSizes = [
    "thumb_256",
    "thumb_96",
    "thumb_48"
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

export function imageViewPath(photo: media.Photo): string | null {

    if (photo) {
        for (const i in photoSizes) {
            if (photoSizes[i] in photo) {
                return `${IMAGE_VIEW_URL}#${btoa(photo[photoSizes[i]])}`;
            }
        }
    }
}

export function giftViewPath(gift: AttachmentGift): string | null {

    if (gift) {
        for (const i in giftSizes) {
            if (giftSizes[i] in gift) {
                return `${IMAGE_VIEW_URL}#${btoa(gift[giftSizes[i]])}`;
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
    const maybeImage = sticker.images
        .sort((a, b) => b.height - a.height)[0];

    return maybeImage
        ? maybeImage.url
        : ""
}

export function buildSrcSet(photo: media.Photo): string {
    const arr: string[] = [];

    photo.sizes.forEach( size =>
        arr.push(`${size.url} ${size.height}w`)
    )

    return arr.toString();
}

export function buildSrcSetGift(photo: AttachmentGift): string {
    const arr: string[] = [];

    if (photo.thumb_48) arr.push(`${photo.thumb_48} 48w`);
    if (photo.thumb_96) arr.push(`${photo.thumb_96} 96w`);
    if (photo.thumb_256) arr.push(`${photo.thumb_256} 256w`);

    return arr.toString();
}