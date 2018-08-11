import * as React from "react"
import {attachmentDiv} from "./AttachmentHelper";
import {Attachment} from "../../../../vk/types/newsfeed";

interface AttachmentProps<A extends Attachment> {
    type: string
    data: A

    showFullWidth: boolean
}

class AttachmentC extends React.Component<AttachmentProps<Attachment>> {

    render() {
        const {type, data, showFullWidth} = this.props;

        return attachmentDiv(type, data, showFullWidth);
    }
}

export default AttachmentC