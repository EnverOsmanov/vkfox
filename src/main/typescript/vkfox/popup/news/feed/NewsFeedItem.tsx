import * as React from "react"
import Item from "../../item/Item";
import {ReplyI} from "../../chat/types";

import I18N from "../../../i18n/i18n";
import ItemActionLike from "../../itemActions/ItemActionLike";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemAction from "../../itemActions/ItemAction";
import ItemActions from "../../itemActions/ItemActions";
import {addVKBase, profile2Name} from "../../filters/filters.pu";
import AttachmentC from "../../attachment/AttachmentC";
import {SendMessageI} from "../../itemActions/types";
import RectifyPu from "../../../rectify/rectify.pu";
import {GroupProfile, UserProfile} from "../../../back/users/types";
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
} from "../../../../vk/types/newsfeed";
import {GenericRS} from "../../../../vk/types";
import {onReply} from "../news.pu";


interface NewsFeedItemProps {
    item    : ItemObj
    owner  : UserProfile | GroupProfile
    profiles: UserProfile[]
}

interface NewsFeedItemState {
    message: string
    reply  : ReplyI
}

class NewsFeedItem extends React.Component<NewsFeedItemProps, NewsFeedItemState> {

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

        const {item, owner} = this.props;

        if ("post_id" in item) {
            const postItem = item as PostItem;

            const scope: SendMessageI = {
                type    : postItem.type,
                id      : postItem.post_id,
                ownerId : postItem.source_id
            };

            return onReply(scope, this.state.message)
                .then(() => this.handleMessageChange(""))
                .catch(err => console.error("Couldn't send message", err));
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

    postAttachmentElms = (itemPost: PostItem) => {
        const singleAttachment = (attachment: AttachmentContainer, i: number) => (
            <AttachmentC
                key={i}
                type={attachment.type}
                data={attachment[attachment.type]}
            />
        );

        return itemPost.attachments
            ? itemPost.attachments.map(singleAttachment)
            : null
    };

    photoAttachmentElms = (photos: AttachmentPhoto[]) => {
        const singleAttachment = (photo: AttachmentPhoto, i: number) => (
            <AttachmentC
                key={i}
                type="photo"
                data={photo}
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
                    <a data-anchor={addVKBase(`/id${friend.user_id}`)}>
                        {profile2Name(profile)}

                        {comma}
                    </a>
                </span>
            )
        };

        return friends.items.map(singleFrined)
    };


    repostedText = (itemPost: PostItem) => {
        if (itemPost.copy_history && itemPost.copy_history[0] && itemPost.copy_history[0].text) {
            return (
                <div>
                    <i className="fa fa-bullhorn"/>
                    {itemPost.copy_history[0].text}
                </div>
            )
        }
        else return null;
    };

    postElm = (itemPost: PostItem) => {

        return (
            <div>
                <div
                    className="news__item-text">
                    <RectifyPu text={itemPost.text} hasEmoji={false}/>
                    {this.repostedText(itemPost)}
                </div>

                {this.postAttachmentElms(itemPost)}

                <ItemActions>

                    <ItemAction
                        className="fa fa-external-link-square"
                        title={I18N.get("Open in New Tab")}
                        anchor={`https://vk.com/wall${itemPost.source_id}_${itemPost.post_id}`}
                    />

                    <ItemActionComment
                        type={itemPost.type}
                        ownerId={itemPost.source_id}
                        id={itemPost.post_id}
                        showIf={itemPost.comments.can_post === 1}
                        showOrHideReply={this.showOrHideReply}
                    />

                    <ItemActionLike
                        ownerId={itemPost.source_id}
                        itemId={itemPost.post_id}
                        likes={itemPost.likes}
                    />

                </ItemActions>
            </div>
        )
    };


    feedItemElm = (item: ItemObj) => {

        switch (item.type) {
            case "post":
                const itemPost = item as PostItem;
                return itemPost.text || itemPost.attachments
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
                return (
                    <div>
                        <div className="news__list_title">{I18N.get("New friends:")}</div>
                        {this.friendsElms((item as FriendItem).friends)}
                    </div>
                );

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
        const {item, owner} = this.props;

        return (
            <Item
                owners={owner}
                reply={this.state.reply}
                sendMessage={() => this.sendMessage()}
                handleMessageChange={this.handleMessageChange}>
                {this.feedItemElm(item)}
            </Item>
        )
    }
}

export default NewsFeedItem