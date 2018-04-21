import * as React from "react"
import Item from "../item/Item";
import I18N from "../../i18n/i18n";
import ItemActions from "../itemActions/ItemActions";
import ItemAction from "../itemActions/ItemAction";
import {ReplyI} from "../chat/types";
import Request from "../../request/request.pu"
import {SendMessageParams} from "../../chat/collections/DialogColl";
import {FoxUserProfileI} from "../../chat/types";

interface BuddyItemProps {
    buddie  : FoxUserProfileI

    toggleFriendWatching(): void
}

interface BuddyItemState {
    message     : string
    reply       : ReplyI
}


class BuddyItem extends React.Component<BuddyItemProps, BuddyItemState> {

    constructor(props) {
        super(props);

        const reply: ReplyI = {
            visible: false
        };

        this.state = {
            message: "",
            reply
        };
    }


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

        const code = `return API.messages.send(${ JSON.stringify(params) });`;

        Request
            .api({ code })
            .then(() => this.handleMessageChange(""));

        // mark messages if not from chat
        if (params.user_id) {
            const code =
                'return API.messages.markAsRead({message_ids: API.messages.getHistory({user_id:'
                + params.user_id + '})@.mid});';

            Request.api({code});
        }
    };


    render(): JSX.Element | any | any {
        const buddie = this.props.buddie;

        return (
            <Item
                key={buddie.id}
                itemClass={`buddies__item ${buddie.isFave && "buddies__item_is-fave"}`}
                description={buddie.description}
                owners={buddie}
                message={this.state.message}
                sendMessage={() => this.onSendMessage(null, buddie.id)}
                handleMessageChange={this.handleMessageChange}
                reply={this.state.reply}>

                {this.bookmarkedElm()}

                <ItemActions>

                    <ItemAction
                        className="fa fa-envelope"
                        title={I18N.get("Private message")}
                        onClick={e => this.showOrHideReply()}
                    />

                    <ItemAction
                        className={`fa fa-bell ${buddie.isWatched && "buddies__item-action_active"}`}
                        title={I18N.get("Monitor online status")}
                        onClick={() => this.props.toggleFriendWatching()}
                    />
                </ItemActions>

            </Item>
        )
    }
}

export default BuddyItem