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

        return (
            <div className={`item__attachment item__attachment_type_${type}`}>
                {attachmentDiv(type, data)}
            </div>
        )
    }
}

export default AttachmentC