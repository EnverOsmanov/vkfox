import * as React from "react"
import {AttachmentContainer} from "../../../../../../vk/types/newsfeed";
import AttachmentC from "../../../attachment/AttachmentC";

export function attachmentsDivM(attachments?: AttachmentContainer[]): JSX.Element {
    if (attachments) {
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

        return (
            <div className="attachments-container">
                {attachments.map(singleAttachment)}
            </div>
        )
    }
    else return null
}