import * as React from "react"
import Item from "../item/Item";
import I18N from "../../i18n/i18n";
import ItemActions from "../itemActions/ItemActions";
import ItemAction from "../itemActions/ItemAction";
import {ReplyI} from "../chat/types";
import Request from "../../request/request.pu"
import {SendMessageParams} from "../../chat/collections/DialogColl";
import {FoxUserProfileI} from "../../chat/types";
import ReplyMessage from "../reply/ReplyMessage";
import {Description} from "../item/ItemDescription";

interface BuddyItemProps {
    buddie  : FoxUserProfileI

    toggleFriendWatching(): void
}

interface BuddyItemState {
    message     : string
    reply       : ReplyI
}


class BuddyItem extends React.Component<BuddyItemProps, BuddyItemState> {

    public readonly state = BuddyItemCpn.initialState;


    bookmarkedElm = () => {

        const buddie = this.props.buddie;

        return buddie.isFave
            ? <span>{I18N.get("Bookmarked")}</span>
            : null
    };

    showOrHideReply = () => {
        this.setState(prevState => {
            const visible = !this.state.reply.visible;

            const reply: ReplyI = { visible };

            return {
                ...prevState,
                reply
            }
        })
    };

    handleMessageChange = (message: string) => {
        this.setState(prevState => {
            return {
                ...prevState,
                message
            }
        })
    };


    onSendMessage = (chatId ?:number, uid?: number) => {
        this.showOrHideReply();

        // send message
        const message = this.state.message.trim();

        const params: SendMessageParams = { message };

        if (chatId) params.chat_id = chatId;
        else params.user_id = uid;

        const method = "messages.send";

        Request
            .directApi(method, params)
            .then(() => this.handleMessageChange(""))
            .catch(console.error);

        // mark messages if not from chat
        if (params.user_id) {
            const code =
                'return API.messages.markAsRead({message_ids: API.messages.getHistory({user_id:'
                + params.user_id + '})@.mid});';

            Request.api({code});
        }
    };

    buddieDescription = (buddy: FoxUserProfileI) =>
        <Description description={buddy.description}/>;


    render(): React.ReactNode {
        const buddie = this.props.buddie;

        return (
            <Item
                key={buddie.id}
                itemClass={`buddies__item ${buddie.isFave && "buddies__item_is-fave"}`}
                ownerClass="item__img"
                description={this.buddieDescription(buddie)}
                owners={buddie}>

                <div className="item__body clearfix">
                    {this.bookmarkedElm()}

                    <ItemActions>

                        <ItemAction
                            className="fa fa-envelope"
                            title={I18N.get("Private message")}
                            onClick={_ => this.showOrHideReply()}
                        />

                        <ItemAction
                            className={`fa fa-bell ${buddie.isWatched && "buddies__item-action_active"}`}
                            title={I18N.get("Monitor online status")}
                            onClick={() => this.props.toggleFriendWatching()}
                        />
                    </ItemActions>

                </div>

                <ReplyMessage
                    reply={this.state.reply}
                    message={this.state.message}
                    sendMessage={() => this.onSendMessage(null, buddie.id)}
                    handleMessageChange={this.handleMessageChange}
                />

            </Item>
        )
    }
}

export default BuddyItem

class BuddyItemCpn {
    private static reply: ReplyI = {
        visible: false
    };

    static initialState: BuddyItemState = {
        message : "",
        reply   : BuddyItemCpn.reply
    };
}