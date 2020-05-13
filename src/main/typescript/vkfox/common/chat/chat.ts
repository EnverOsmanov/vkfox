import {Message, MessageWithAction} from "../../../vk/types";

export function extractIdsFromMessage(m: Message): number[] {
    const fwdIds = m.fwd_messages.map(f => f.from_id)

    const replyIds = m.reply_message ? [m.reply_message.from_id] : []

    function actionIds(): number[] {

        if ("action" in m) {
            const {action} = (m as MessageWithAction)

            return "member_id" in action
                ? [action.member_id]
                : [];
        }
        else return []
    }

    return [m.from_id].concat(fwdIds, replyIds, actionIds())
}