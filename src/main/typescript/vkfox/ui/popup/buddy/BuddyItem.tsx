import * as React from "react"
import I18N from "../../../common/i18n/i18n";
import ItemActions from "../components/itemActions/ItemActions";
import ItemAction from "../components/itemActions/ItemAction";
import {ReplyI} from "../chat/types";
import Request from "../components/request/request.pu"
import {SendMessageParams} from "../chat/types";
import {FoxUserProfileI} from "../../../common/chat/types";
import ReplyMessage from "../components/reply/ReplyMessage";
import {Description} from "../components/item/ItemDescription";
import ItemHero from "../components/item/ItemHero";

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


    onSendMessage = (uid: number) => {
        this.showOrHideReply();

        // send message
        const message = this.state.message.trim();

        const params: SendMessageParams = {
            message,
            user_id: uid
        };

        const method = "messages.send";

        Request
            .directApi<void>(method, params)
            .then(() => this.handleMessageChange(""))
            .catch(console.error);
    };

    static buddieDescription(buddy: FoxUserProfileI) {
        return <Description description={buddy.description}/>;
    }


    render(): React.ReactNode {
        const {buddie} = this.props;

        const isFaveClass = !!buddie.isFave
            ? " buddies__item_is-fave"
            : "";

        const isWatchedClass = !!buddie.isWatched
            ? " buddies__item-action_active"
            : "";

        return (
            <div
                key={buddie.id}
                className={`item buddies__item${isFaveClass}`}
            >
                <ItemHero
                    description={BuddyItem.buddieDescription(buddie)}
                    owners={buddie}
                    ownerClass="item__img"
                />

                <div className="item__body clearfix">
                    {this.bookmarkedElm()}

                    <ItemActions>

                        <ItemAction
                            className="fa fa-envelope"
                            title={I18N.get("Private message")}
                            onClick={_ => this.showOrHideReply()}
                        />

                        <ItemAction
                            className={`fa fa-bell${isWatchedClass}`}
                            title={I18N.get("Monitor online status")}
                            onClick={() => this.props.toggleFriendWatching()}
                        />
                    </ItemActions>

                </div>

                <ReplyMessage
                    reply={this.state.reply}
                    message={this.state.message}
                    sendMessage={() => this.onSendMessage(buddie.id)}
                    handleMessageChange={this.handleMessageChange}
                />

            </div>
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