import * as React from "react"
import {CSSProperties} from "react"
import Browser from '../browser/browser.pu'
import Request from '../request/request.pu'
import * as $ from "jquery"
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

interface AttachmentProps<A extends Attachment> {
    type: string
    data: A
}

class AttachmentC extends React.Component<AttachmentProps<Attachment>> {

    componentDidMount(): void {
        const VIDEO_VIEW_URL = 'http://vkfox.io/video/';

        $(document).on("click", '.item__video', function (e) {
            const jTarget = $(e.currentTarget);
            const videos = [
                jTarget.data('id'),
                jTarget.data('access-key')
            ].filter(Boolean).join('_');

            const params = { videos };
            const code = `return API.video.get(${ JSON.stringify(params) });`;

            Request
                .api({ code } )
                .then((data) => {
                    if (data && data[1]) {
                        Browser.createTab(VIDEO_VIEW_URL + '#' + btoa(data[1].player));
                    }
                });
        });
    }

    private static imageProperties(src: string): CSSProperties {
        return {
            backgroundImage: `url(${src})`
        }
    }

    static attachmentDiv(type: string, data: Attachment) {
        switch (type) {
            /*            case "app":
                            return <img src={data as Att.src}/>;*/
            case "audio":
                const dataAudio = data as AttachmentAudio;
                return (
                    <div>
                        <i className="fa fa-music"/>
                        {dataAudio.performer} - { dataAudio.title }
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
                        style={AttachmentC.imageProperties(dataGraffiti.src_big)}
                        data-anchor={imageViewPath()(dataGraffiti)}>
                    </div>
                );

            case "video":
                const dataVideo = data as AttachmentVideo;
                return (
                    <div
                        className="item__video"
                        data-id={`${dataVideo.owner_id}_${dataVideo.vid}`}
                        data-access-key={dataVideo.access_key}
                        style={AttachmentC.imageProperties(dataVideo.image)}>
                        <div className="item__video-desc">
                            <div className="item__video-title">{dataVideo.title}</div>
                            <div className="item__video-duration">{duration()(dataVideo.duration)}</div>
                        </div>

                    </div>
                );
            default:
                console.warn("Unknown attachment", type, data);
                return <div />;
        }
    }

    render() {
        const type = this.props.type;
        const data = this.props.data;

        return (
            <div className={`item__attachment item__attachment_type_${type}`}>
                {AttachmentC.attachmentDiv(type, data)}
            </div>
        )
    }
}

export default AttachmentC