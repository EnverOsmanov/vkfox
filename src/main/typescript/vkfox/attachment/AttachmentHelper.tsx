import * as React from "react"
import {CSSProperties} from "react"
import Browser from '../browser/browser.pu'
import Request from '../request/request.pu'
import {
    Attachment,
    AttachmentAudio,
    AttachmentDoc,
    AttachmentGraffiti,
    AttachmentLink,
    AttachmentNote,
    AttachmentPoll,
    AttachmentVideo
} from "../newsfeed/models";
import {docViewPath, imageViewPath} from "../item/item.pu";
import {duration} from "../filters/filters.pu";


const VIDEO_VIEW_URL = 'http://vkfox.io/video/';

function imageProperties(src: string): CSSProperties {
    return {
        backgroundImage: `url(${src})`
    }
}

function onVideoClick(dataVideo: AttachmentVideo) {
    const videos = `${dataVideo.owner_id}_${dataVideo.vid}_${dataVideo.access_key}`;

    const params = {videos};
    const code = `return API.video.get(${ JSON.stringify(params) });`;

    Request
        .api({code})
        .then((data) => {
            return data && data[1]
                ? Browser.createTab(VIDEO_VIEW_URL + '#' + btoa(data[1].player))
                : Promise.resolve()
        });
}

export function attachmentDiv(type: string, data: Attachment) {
    switch (type) {
        /*            case "app":
                        return <img src={data as Att.src}/>;*/
        case "audio":
            const dataAudio = data as AttachmentAudio;
            return (
                <div>
                    <i className="fa fa-music"/>
                    {dataAudio.performer} - {dataAudio.title}
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
            const dataDoc = data as AttachmentDoc;
            return (
                <a className="item__link" data-anchor={docViewPath()(dataDoc)}>
                    <i className="fa fa-file"/>
                    {dataDoc.title}
                </a>
            );

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
            const dataGraffiti = data as AttachmentGraffiti;
            return (
                <div
                    className="item__picture"
                    style={imageProperties(dataGraffiti.src_big)}
                    data-anchor={imageViewPath()(dataGraffiti)}>
                </div>
            );

        case "video":
            const dataVideo = data as AttachmentVideo;
            return (
                <div
                    className="item__video"
                    style={imageProperties(dataVideo.image)}
                    onClick={() => onVideoClick(dataVideo)}>

                    <div className="item__video-desc">
                        <div className="item__video-title">{dataVideo.title}</div>
                        <div className="item__video-duration">{duration()(dataVideo.duration)}</div>
                    </div>

                </div>
            );
        default:
            console.warn("Unknown attachment", type, data);
            return <div/>;
    }
}