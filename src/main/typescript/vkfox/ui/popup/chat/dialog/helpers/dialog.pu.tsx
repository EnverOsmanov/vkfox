import * as React from "react"
import {AttachmentContainer} from "../../../../../../vk/types/attachment";
import AttachmentC from "../../../components/attachment/AttachmentC";

export function attachmentsDivM(attachments?: AttachmentContainer[]): JSX.Element {
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
        ? (
            <div className="attachments-container">
                {attachments.map(singleAttachment)}
            </div>
        ) : null;
}