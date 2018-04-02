import * as React from "react"
import Item from "../../item/Item";
import {ReplyI} from "../../../chat/Chat";
import {
    AttachmentContainer, AudioAudio, AudioItem, Friend, FriendItem, ItemObj, Photo, PhotoTagItem, PostItem,
    WallPhotoItem
} from "../../../newsfeed/types";
import I18N from "../../../i18n/i18n";
import ItemActionLike from "../../itemActions/ItemActionLike";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemAction from "../../itemActions/ItemAction";
import ItemActions from "../../itemActions/ItemActions";
import {addVKBase, profile2Name} from "../../filters/filters.pu";
import AttachmentC from "../../attachment/AttachmentC";
import {ProfileI} from "../../../chat/collections/ProfilesColl";
import Request from "../../../request/request.pu";
import {SendMessageI} from "../../itemActions/types";
import RectifyPu from "../../../rectify/rectify.pu";


interface NewsFeedItemProps {
    item    : ItemObj
    owners  : ProfileI
    profiles: ProfileI[]
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

    static onReply(scope: SendMessageI, message: string): Promise<void> {
        const params: any = {};
        let method;

        switch (scope.type) {
            case 'wall':
            case 'post':
                params.owner_id = scope.ownerId;
                params.post_id = scope.id;
                method = 'wall.addComment';
                params.text = message;
                if (scope.replyTo) {
                    params.reply_to_cid = scope.replyTo;
                }
                break;
            case 'topic':
                params.gid = Math.abs(scope.ownerId);
                params.tid = scope.id;
                params.text = message;
                method = 'board.addComment';
                break;
            case 'photo':
                params.oid = scope.ownerId;
                params.pid = scope.id;
                params.message = message;
                method = 'photos.createComment';
                break;
            case 'video':
                params.owner_id = scope.ownerId;
                params.video_id = scope.id;
                params.message = message;
                method = 'video.createComment';
                break;
        }

        if (method) {
            const code = `return API.${ method }(${ JSON.stringify(params) });`;

            return Request.api({ code })
                .catch(err => console.error("Couldn't send message", err));
        }
        else return Promise.resolve();
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

        const ownerId = this.props.owners.id;
        const item = this.props.item;

        const scope: SendMessageI = {
            type: item.type,
            id  : item.post_id,
            ownerId
        };

        return NewsFeedItem.onReply(scope, this.state.message)
            .then(() => this.handleMessageChange(""))
            .catch(err => console.error("Couldn't send message", err));
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

    photoAttachmentElms = (photos: Photo[]) => {
        const singleAttachment = (photo: Photo, i: number) => (
            <AttachmentC
                key={i}
                type="photo"
                data={photo}
            />
        );

        return photos.slice(1).map(singleAttachment)
    };

    friendsElms = (friends: Friend[]) => {
        const lastIndex = friends.length - 2;

        const singleFrined = (friend: Friend, i: number) => {
            const profile = this.props.profiles
                .find(profile => profile.id === friend.uid);

            const comma = i === lastIndex
                ? null
                : <span>, </span>;

            return (
                <span key={friend.uid}>
                    <a data-anchor={addVKBase(`/id${friend.uid}`)}>
                        {profile2Name(profile)}

                        {comma}
                    </a>
                </span>
            )
        };

        return friends.slice(1).map(singleFrined)
    };

    postElm = (itemPost: PostItem) => {
        return (
            <div>
                <div
                    className="news__item-text">
                    <RectifyPu text={itemPost.text} hasEmoji={false}/>
                </div>

                {this.postAttachmentElms(itemPost)}

                <ItemActions>

                    <ItemAction
                        className="fa fa-external-link-square"
                        title={I18N.get("Open in New Tab")}
                        anchor={`http://vk.com/wall${itemPost.source_id}_${itemPost.post_id}`}
                    />

                    <ItemActionComment
                        type={itemPost.type}
                        ownerId={itemPost.source_id}
                        id={itemPost.post_id}
                        showIf={itemPost.comments.can_post}
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
                return this.photoAttachmentElms((item as WallPhotoItem).photos as Photo[]);

            case "photo_tag":
                const photoTagItem = item as PhotoTagItem;
                return this.photoAttachmentElms(photoTagItem.photo_tags);

            case "note":
                return JSON.stringify(item);

            case "friend":
                return (
                    <div>
                        {I18N.get("New friends:")}
                        {this.friendsElms((item as FriendItem).friends as Friend[])}
                    </div>
                );

            case "audio":
                const audioItem = item as AudioItem;

                const audios = audioItem.audio.slice(1).map( (audio: AudioAudio, i: number) => {
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
                return <div>{I18N.get("New video:")}</div>;
            default:
                console.warn("Unknown feed item.type", item);
                break;
        }
    };


    render() {
        const item = this.props.item;
        const owners = this.props.owners;

        return (
            <Item
                owners={owners}
                reply={this.state.reply}
                sendMessage={() => this.sendMessage()}
                handleMessageChange={this.handleMessageChange}>
                {this.feedItemElm(item)}
            </Item>
        )
    }
}

export default NewsFeedItem