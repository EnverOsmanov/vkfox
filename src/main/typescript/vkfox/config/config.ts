"use strict";

const isDev = process.env.NODE_ENV === "development";

export const APP_ID = isDev
    ? 6449063
    : 4791855;

export const TRACKER_ID = 'UA-9568575-4';

export const VK_PROTOCOL = 'https://';
export const VK_BASE = VK_PROTOCOL + 'vk.com/';

export const API_VERSION             = 5.74;

// HTTPS only
// @see http://vk.com/pages?oid=-1&p=%D0%92%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%BE%D0%B2_%D0%BA_API
export const AUTH_DOMAIN = 'https://oauth.vk.com/';
export const AUTH_URI = [
    AUTH_DOMAIN,
    'authorize?',
    [
        'client_id=' + APP_ID,
        'scope=friends,photos,audio,video,docs,notes,pages,wall,groups,messages,notifications',
        'response_type=token',
        'redirect_uri=' + encodeURIComponent('https://oauth.vk.com/blank.html'),
        'display=page',
        `v=${API_VERSION}`
    ].join('&')
].join('');
