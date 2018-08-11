import * as React from "react"
import {ReplyI} from "../../chat/types";
import * as _ from "underscore"
import I18N from "../../../../common/i18n/i18n";
import ItemActionLike from "../../itemActions/ItemActionLike";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemAction from "../../itemActions/ItemAction";
import ItemActions from "../../itemActions/ItemActions";
import {addVKBase, profile2Name} from "../../filters/filters.pu";
import AttachmentC from "../../attachment/AttachmentC";
import RectifyPu from "../../../../rectify/RectifyPu";
import {UserProfile} from "../../../../back/users/types";
import {
    AttachmentContainer,
    AttachmentPhoto,
    AudioItem,
    FriendItem,
    ItemObj,
    PhotoTagItem,
    PostItem,
    UserId,
    VideoItem,
    WallPhotoItem
} from "../../../../../vk/types/newsfeed";
import {GenericRS} from "../../../../../vk/types";
import {onReply} from "../news.pu";
import ReplyMessage from "../../reply/ReplyMessage";
import {SendMessageI} from "../../../../common/feedbacks/types";
import BrowserPu from "../../../../browser/browser.pu";
import ItemHero from "../../item/ItemHero";


interface NewsFeedItemProps {
    item    : ItemObj
    profiles: UserProfile[]
}

interface NewsFeedItemState {
    message: string
    reply  : ReplyI
}

class NewsFeedItem extends React.Component<NewsFeedItemProps, NewsFeedItemState> {

    public readonly state = NewsFeedItemCpn.initialState;


    handleMessageChange = (message: string) => {
        this.setState(prevState => {
            return {
                ...prevState,
                message
            }
        })
    };

    sendMessage = () => {
        this.showOrHideReply();

        const {item} = this.props;

        if ("post_id" in item) {
            const postItem = item as PostItem;

            const scope: SendMessageI = {
                type    : postItem.type,
                id      : postItem.post_id,
                ownerId : postItem.source_id
            };

            return onReply(scope, this.state.message)
                .then(() => this.handleMessageChange(""));
        }
        else return Promise.resolve();
    };


    showOrHideReply = () => {
        this.setState(prevState => {
            const visible = !this.state.reply.visible;

            const reply: ReplyI = {
                visible
            };

            return {
                ...prevState,
                reply
            }
        })
    };

    static postAttachmentElms(itemPost: PostItem): JSX.Element[] {
        function postAttachments(attachments: AttachmentContainer[]) {
            const counted: _.Dictionary<number> = _.countBy(attachments, it => it.type);

            function singleAttachment(attachment: AttachmentContainer, i: number): JSX.Element {

                return (
                    <AttachmentC
                        key={i}
                        type={attachment.type}
                        data={attachment[attachment.type]}
                        showFullWidth={counted[attachment.type] === 1}
                    />
                );
            }

            return attachments.map(singleAttachment)
        }

        return itemPost.attachments
            ? postAttachments(itemPost.attachments)
            : null
    };

    photoAttachmentElms = (photos: AttachmentPhoto[]) => {
        const singleAttachment = (photo: AttachmentPhoto, i: number) => (
            <AttachmentC
                key={i}
                type="photo"
                data={photo}
                showFullWidth={photos.length === 1}
            />
        );

        return photos.map(singleAttachment)
    };

    friendsElms = (friends: GenericRS<UserId>) => {
        const lastIndex = friends.count - 1;

        const singleFrined = (friend: UserId, i: number) => {

            const profile = this.props.profiles
                .find(profile => profile.id === friend.user_id);

            const comma = i === lastIndex
                ? null
                : <span>, </span>;

            return (
                <span key={friend.user_id}>
                    <a
                        className="data-anchor"
                        onClick={_ => BrowserPu.createTab(addVKBase(`/id${friend.user_id}`))}>
                        {profile2Name(profile)}

                        {comma}
                    </a>
                </span>
            )
        };

        return friends.items.map(singleFrined)
    };


    static repostsElm(itemPost: PostItem): JSX.Element[] {
        function repostElm(originP: PostItem, i: number): JSX.Element {
            if (originP.text || originP.attachments) {
                return (
                    <div key={i}>
                        <i className="news__post_repost fa fa-bullhorn"/>

                        <RectifyPu text={originP.text} hasEmoji={false}/>

                        {NewsFeedItem.postAttachmentElms(originP)}
                    </div>
                )
            }
            else return null;
        }

        return itemPost.copy_history
            ? itemPost.copy_history.map(repostElm)
            : null;
    };

    postElm = (itemPost: PostItem) => {

        return (
            <div>
                <RectifyPu text={itemPost.text} hasEmoji={false}/>

                {NewsFeedItem.repostsElm(itemPost)}

                {NewsFeedItem.postAttachmentElms(itemPost)}

                <ItemActions>

                    <ItemAction
                        className="fa fa-external-link-square"
                        title={I18N.get("Open in New Tab")}
                        onClick={_ => BrowserPu.createTab(`https://vk.com/wall${itemPost.source_id}_${itemPost.post_id}`)}
                    />

                    <ItemActionComment
                        showIf={itemPost.comments.can_post === 1}
                        showOrHideReply={this.showOrHideReply}
                    />

                    <ItemActionLike
                        ownerId={itemPost.source_id}
                        itemId={itemPost.post_id}
                        likes={itemPost.likes}
                        classPrefix="item"
                    />

                </ItemActions>
            </div>
        )
    };


    feedItemElm = (item: ItemObj) => {

        switch (item.type) {
            case "post":
                const itemPost = item as PostItem;
                return itemPost.text || itemPost.attachments || itemPost.copy_history
                    ? this.postElm(itemPost)
                    : null;

            case "photo":
            case "wall_photo":
                return this.photoAttachmentElms((item as WallPhotoItem).photos.items);

            case "photo_tag":
                const photoTagItem = item as PhotoTagItem;
                return this.photoAttachmentElms(photoTagItem.photo_tags.items);

            case "note":
                return JSON.stringify(item);

            case "friend":
                const friendItem = item as FriendItem;

                if ("friends" in friendItem) {
                    return (
                        <div>
                            <div className="news__list_title">{I18N.get("New friends:")}</div>
                            {this.friendsElms(friendItem.friends)}
                        </div>
                    );
                }
                else {
                    console.warn("Newsfeed with type 'friend' has no 'friends' field");
                    return null;
                }

            case "audio":
                const audioItem = item as AudioItem;

                const audios = audioItem.audio.items.map( (audio, i) => {
                    return (
                        <div key={i}>
                            <i className="fa fa-music"/>
                            {audio.artist} - {audio.title}
                        </div>
                    )
                });

                return (
                    <div>
                        {I18N.get("New music:")}
                        {audios}
                    </div>
                );

            case "video":
                const videoItem = item as VideoItem;
                const videos = videoItem.video.items.map( (v, i) => {
                    return (
                        <div key={i}>
                            <i className="fa fa-video-camera"/>
                            {v.title}
                        </div>
                    );
                });

                return (
                    <div>
                        {I18N.get("New video:")}
                        {videos}
                        </div>
                );
            default:
                console.warn("Unknown feed item.type", item);
                break;
        }
    };


    render() {
        const {item, profiles} = this.props;

        const owner = profiles.find(profile => profile.id === Math.abs(item.source_id));

        if (owner) {
            return (
                <div className="item card-1 scrollable-card">

                    <ItemHero
                        owners={owner}
                        ownerClass="item__img"
                    />

                    <div className="item__body clearfix">
                        {this.feedItemElm(item)}
                    </div>

                    <ReplyMessage
                        reply={this.state.reply}
                        message={this.state.message}
                        sendMessage={() => this.sendMessage()}
                        handleMessageChange={this.handleMessageChange}
                    />
                </div>
            )
        }
        else {
            console.warn("Owner not found for feed", item);
            return null
        }
    }
}

export default NewsFeedItem


class NewsFeedItemCpn {

    private static reply: ReplyI = {
        visible: false
    };

    static initialState: NewsFeedItemState = {
        message: "",
        reply : NewsFeedItemCpn.reply
    };

}