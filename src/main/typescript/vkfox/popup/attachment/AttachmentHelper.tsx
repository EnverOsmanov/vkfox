import * as React from "react"
import {CSSProperties} from "react"
import Browser from "../../browser/browser.pu"
import Request from "../../request/request.pu"
import {docViewPath, imageViewPath, imageViewPathByUrl, stickerImageUrl, stickerViewPath} from "../item/item.pu";
import {duration} from "../filters/filters.pu";
import {VideoGetUserVideosResponse} from "../../../vk/types";
import {
    Attachment,
    AttachmentAudio,
    AttachmentDoc,
    AttachmentLink,
    AttachmentNote,
    AttachmentPhoto,
    AttachmentPoll,
    AttachmentSticker,
    AttachmentVideo,
    AttachmentWall
} from "../../../vk/types/newsfeed";


const VIDEO_VIEW_URL = "/pages/video.html";

function imageProperties(src: string): CSSProperties {
    return {
        backgroundImage: `url(${src})`
    }
}

function onVideoClick(dataVideo: AttachmentVideo): Promise<void> {
    const videos = `${dataVideo.owner_id}_${dataVideo.id}_${dataVideo.access_key}`;

    const params = {videos};
    const code = `return API.video.get(${ JSON.stringify(params) });`;

    return Request
        .api<VideoGetUserVideosResponse>({code})
        .then((data) => {
            return data && data.items[0]
                ? Browser.createTab(VIDEO_VIEW_URL + "#" + btoa(data.items[0].player)).then(_ => {})
                : Promise.resolve()
        });
}


function documentDiv(dataDoc: AttachmentDoc): JSX.Element {
    switch (dataDoc.type) {
        case 3: {
            const previewUrl = dataDoc.preview.photo.sizes.sort( (a, b) => b.width - a.width)
                .find(p => p.width <= 604)
                .src;

            return (
                <div className={`item__attachment item__attachment_type_photo`}>
                    <div
                        className={`item__picture`}
                        style={imageProperties(previewUrl)}
                        data-anchor={imageViewPathByUrl(dataDoc.url)}>

                        <div className="item__video-desc">
                            <div className="item__video-title">{"GIF"}</div>
                        </div>

                    </div>
                </div>
            )
        }

        default: {
            return (
                <a className="item__link" data-anchor={docViewPath(dataDoc)}>
                    <i className="fa fa-file"/>
                    {dataDoc.title}
                </a>
            );
        }
    }

}

function imageDiv(type: string, dataGraffiti: AttachmentPhoto, showFullWidth: boolean) {

    if (showFullWidth) {
        return (
            <img
                className={"item__hero-picture"}
                src={dataGraffiti.photo_604}
                data-anchor={imageViewPath(dataGraffiti)}
            />
        )
    }
    else {
        return (
            <div className={`item__attachment item__attachment_type_${type}`}>
                <img
                    className={"item__picture"}
                    src={dataGraffiti.photo_604}
                    data-anchor={imageViewPath(dataGraffiti)}
                />
            </div>
        );
    }
}

export function attachmentDiv(type: string, data: Attachment, showFullWidth: boolean): JSX.Element | null {
    switch (type) {
        /*            case "app":
                        return <img src={data as Att.src}/>;*/
        case "audio":
            const dataAudio = data as AttachmentAudio;
            return (
                <div>
                    <i className="fa fa-music"/>
                    {dataAudio.artist} - {dataAudio.title}
                </div>
            );

        case "note":
            const dataNote = data as AttachmentNote;
            return (
                <a data-anchor={`/note/${dataNote.owner_id}_${dataNote.nid}`}>
                    <i className="fa fa-file"/>
                    {dataNote.title}
                </a>
            );

        case "doc":
            return documentDiv(data as AttachmentDoc);

        case "poll":
            const dataPoll = data as AttachmentPoll;
            return (
                <div>
                    <i className="fa fa-list-alt"/>
                    {dataPoll.question}
                </div>
            );

        case "link":
            const dataLink = data as AttachmentLink;
            return (
                <a className="item__link" data-anchor={dataLink.url}>
                    <i className="fa fa-share"/>
                    {dataLink.url}
                </a>
            );


        case "graffiti":
        case "photo":
        case "posted_photo":
            return imageDiv(type, data as AttachmentPhoto, showFullWidth);

        case "video":
            const dataVideo = data as AttachmentVideo;
            return (
                <div className={`item__attachment item__attachment_type_${type}`}>
                    <div
                        className="item__video"
                        style={imageProperties(dataVideo.photo_320)}
                        onClick={() => onVideoClick(dataVideo)}
                        >

                        <div className="item__video-desc">
                            <div className="item__video-title">{dataVideo.title}</div>
                            <div className="item__video-duration">{duration(dataVideo.duration)}</div>
                        </div>

                    </div>
                </div>
            );
        case "sticker":
            const sticker = data as AttachmentSticker;
            return (
                <div
                    className="item__sticker"
                    style={imageProperties(stickerImageUrl(sticker))}
                    data-anchor={stickerViewPath(sticker)}>

                </div>
            );
        case "wall":
            const wall = data as AttachmentWall;
            return (
                <div className="item__attachment">
                    <i className="fa fa-bullhorn"/>

                    { wall.text}
                </div>
            );
        default:
            console.warn("Unknown attachment", type, data);
            return null;
    }
}