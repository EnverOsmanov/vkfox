import * as React from "react"
import {AttachmentContainer} from "../../../../../../vk/types/attachment";
import AttachmentC from "../../../components/attachment/AttachmentC";

export function attachmentsDivM(attachments?: AttachmentContainer[]) {
    function singleAttachment(attachment: AttachmentContainer, i: number): JSX.Element {

        return (
            <AttachmentC
                key={i}
                type={attachment.type}
                data={attachment[attachment.type]}
                showFullWidth={false}
            />
        );
    }

    return attachments
        ? attachments.map(singleAttachment)
        : null;
}