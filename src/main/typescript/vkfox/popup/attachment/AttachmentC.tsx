import * as React from "react"
import {attachmentDiv} from "./AttachmentHelper";
import {Attachment} from "../../../vk/types/newsfeed";

interface AttachmentProps<A extends Attachment> {
    type: string
    data: A
}

class AttachmentC extends React.Component<AttachmentProps<Attachment>> {

    render() {
        const type = this.props.type;
        const data = this.props.data;

        return attachmentDiv(type, data);
    }
}

export default AttachmentC