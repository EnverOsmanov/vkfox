import * as React from "react"
import {CSSProperties} from "react"
import * as _ from "lodash"

import Browser, {default as BrowserPu} from "../../../../browser/browser.pu"
import Request from "../request/request.pu"
import {
    buildSrcSet,
    buildSrcSetGift,
    docViewPath,
    giftViewPath,
    imageViewPath,
    imageViewPathByUrl,
    stickerImageUrl,
    stickerViewPath,
    videoViewPathByUrl
} from "../item/item.pu";
import {duration} from "../filters/filters.pu";
import {VideoGetUserVideosResponse} from "../../../../../vk/types";
import {
    Attachment, AttachmentContainer,
    AttachmentDoc,
    AttachmentDocType,
    AttachmentGift,
    AttachmentLink,
    AttachmentNote,
    AttachmentPoll,
    AttachmentSticker, AttachmentT,
    AttachmentWall
} from "../../../../../vk/types/attachment";
import RectifyPu from "../../../../rectify/RectifyPu";
import MyFeedbackPost from "../../news/my/MyFeedbackPost";
import {media, PreviewAudioMsg} from "../../../../../vk/types/newsfeed";
import AttachmentC from "./AttachmentC";
import Sticker from "./sticker/Sticker";


function imageProperties(src: string): CSSProperties {
    return {
        backgroundImage: `url(${src})`
    }
}

function onVideoClick(dataVideo: media.Video): Promise<void> {
    const videos = `${dataVideo.owner_id}_${dataVideo.id}_${dataVideo.access_key}`;

    const params = {videos};
    const code = `return API.video.get(${ JSON.stringify(params) });`;

    return Request
        .api<VideoGetUserVideosResponse>({code})
        .then((data) => {
            return data && data.items[0]
                ? Browser.createTab(videoViewPathByUrl(data.items[0].player)).then(_ => {})
                : Promise.resolve()
        });
}


function documentDiv(dataDoc: AttachmentDoc): JSX.Element {
    switch (dataDoc.type) {
        case AttachmentDocType.Gif: {
            const previewUrl = dataDoc.preview.photo.sizes
                .sort( (a, b) => b.width - a.width)
                .find(p => p.width <= 604)
                .src;

            return (
                <div className="item__attachment item__attachment_type_photo item__attachment__wide">
                    <img
                        alt=""
                        className="item__picture"
                        src={previewUrl}
                        onClick={_ => BrowserPu.createTab(imageViewPathByUrl(dataDoc.url))}
                    />
                    <div className="item__video-desc">
                        <div className="item__video-duration">{"GIF"}</div>
                    </div>
                </div>
            )
        }

        case AttachmentDocType.Audio: {
            const {audio_msg} = dataDoc.preview;

            return audioMessageDiv(audio_msg);
        }

        default: {
            return (
                <a
                    className="item__link"
                    onClick={_ => BrowserPu.createTab(docViewPath(dataDoc))}>
                    <i className="fa fa-file"/>
                    {dataDoc.title}
                </a>
            );
        }
    }

}

function audioMessageDiv(audio_msg: PreviewAudioMsg) {
    return (
        <a
            className={`item__link`}
            onClick={_ => BrowserPu.createTab(videoViewPathByUrl(audio_msg.link_ogg))}>
            <i className="fa fa-music"/>
            {duration(audio_msg.duration)}
        </a>
    )
}

function imageDiv(type: string, dataGraffiti: media.Photo, showFullWidth: boolean): JSX.Element {
    const first = dataGraffiti.sizes[0]
    const size = first.height != 0
        ? first
        : dataGraffiti.sizes.find(s => s.type == "x")

    const image = (
        <img
            alt=""
            className="item__picture lazyload"
            data-srcset={buildSrcSet(dataGraffiti)}
            data-src={size.url}
            onClick={_ => BrowserPu.createTab(imageViewPath(dataGraffiti))}
        />
    );


    return showFullWidth
        ? (
            <div className="item__attachment__wide">
                {image}
            </div>
        )
        : image
}

function videoDiv(dataVideo: media.Video, showFullWidth: boolean): JSX.Element {
    const wideClassName = showFullWidth
        ? "item__attachment__wide"
        : "";

    const image = dataVideo.image.find(e => e.width == 320)

    return (
        <div className={`item__attachment item__attachment_type_video ${wideClassName}`}>
            <img
                alt=""
                className="item__video__poster lazyload"
                data-src={image.url}
                onClick={() => onVideoClick(dataVideo)}
            />
            <div className="item__video-desc">
                <div className="item__video-title">{dataVideo.title}</div>
                <div className="item__video-duration">{duration(dataVideo.duration)}</div>
            </div>
        </div>
    );
}

export default function attachmentDiv(type: AttachmentT, data: Attachment, showFullWidth: boolean): JSX.Element | null {
    switch (type) {
        /*            case "app":
                        return <img src={data as Att.src}/>;*/
        case "podcast":
        case "audio":
            const dataAudio = data as media.Audio | media.Podcast;
            return (
                <div className="item__attachment__wide">
                    <i className="fa fa-music"/>
                    {dataAudio.artist} - {dataAudio.title}
                </div>
            );

        case "audio_message": {
            const dataAudioMessage = data as media.AudioMessage;

            return audioMessageDiv(dataAudioMessage);
        }

        case "note":
            const dataNote = data as AttachmentNote;
            return (
                <a onClick={_ => BrowserPu.createTab(`/note/${dataNote.owner_id}_${dataNote.nid}`)}>
                    <i className="fa fa-file"/>
                    {dataNote.title}
                </a>
            );

        case "doc":
            return documentDiv(data as AttachmentDoc);

        case "poll":
            const dataPoll = data as AttachmentPoll;

            const answers = dataPoll.answers.map( answer => (
                <li key={answer.id} className="poll__answer">
                    {answer.text}
                </li>
            ));

            return (
                <ul className="poll item__attachment__wide">
                    <i className="fa fa-list-alt"/>
                    {dataPoll.question}
                    {answers}
                </ul>
            );

        case "link": {
            const dataLink = data as AttachmentLink;

            const image = dataLink.button && dataLink.photo.sizes[0].url ?
                <img
                    alt=""
                    className="item__picture"
                    srcSet={buildSrcSet(dataLink.photo)}
                    src={dataLink.photo.sizes[0].url}
                />
                : null;

            return (
                <div className="item__attachment__wide">
                    {image}
                    <a
                        className="item__text_link"
                        onClick={_ => BrowserPu.createTab(dataLink.url)}>
                        <i className="fa fa-share"/>
                        {dataLink.title}
                    </a>
                </div>
            );
        }

        case "graffiti":
        case "photo":
        case "posted_photo":
            return imageDiv(type, data as media.Photo, showFullWidth);

        case "video":
            return videoDiv(data as media.Video, showFullWidth);

        case "sticker":
            const sticker = data as AttachmentSticker;

            return "animation_url" in sticker
                ? <Sticker sticker={sticker}/>
                : (
                <img
                    alt=""
                    className="item__sticker"
                    src={stickerImageUrl(sticker)}
                    onClick={_ => BrowserPu.createTab(stickerViewPath(sticker))}
                />
                );
        case "wall":
            const wall = data as AttachmentWall;
            return (
                <div className="item__attachment chat__fwd card-1">
                    <i className="fa fa-bullhorn"/>

                    <div className="item__post">
                        <RectifyPu text={wall.text} hasEmoji={false}/>
                        {MyFeedbackPost.repostsElm(wall)}
                        { postAttachmentsO(wall.attachments)}
                    </div>

                </div>
            );
        case "gift":
            const gift = data as AttachmentGift;
            return (
                <img
                    alt=""
                    className="item__picture"
                    srcSet={buildSrcSetGift(gift)}
                    src={gift.thumb_256}
                    onClick={_ => BrowserPu.createTab(giftViewPath(gift))}
                />
            );

        default:
            console.warn("Unknown attachment", type, data);
            return null;
    }
}

export function postAttachmentsO(attachments?: AttachmentContainer[]): JSX.Element[] | null {
    const counted: _.Dictionary<number> = _.countBy(attachments, it => it.type);

    function singleAttachment(attachment: AttachmentContainer, i: number): JSX.Element {

        return (
            <AttachmentC
                key={i}
                type={attachment.type}
                data={attachment[attachment.type]}
                showFullWidth={i == 0 && counted[attachment.type] % 2 != 0}
            />
        );
    }

    return attachments?.map(singleAttachment)
}