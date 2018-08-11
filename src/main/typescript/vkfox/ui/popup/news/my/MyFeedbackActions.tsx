import * as React from "react"
import ItemActions from "../../itemActions/ItemActions";
import {getSourceLink, unsubscribe} from "../news.pu";
import {Capitalize} from "../../filters/filters.pu";
import I18N from "../../../../common/i18n/i18n";
import ItemAction from "../../itemActions/ItemAction";
import ItemActionComment from "../../itemActions/ItemActionComment";
import ItemActionLike from "../../itemActions/ItemActionLike";
import {ParentObj, ParentObjPost, SendMessageI, TopicParFromComm} from "../../../../common/feedbacks/types";
import {FeedbackItemObj} from "../types";
import BrowserPu from "../../../../browser/browser.pu";


interface MyFeedbackActionsProps {
    item: FeedbackItemObj
    actionsData: SendMessageI | null

    showOrHideReply(): void
}

class MyFeedbackActions extends React.Component<MyFeedbackActionsProps, object> {


    actionComment = (comment: SendMessageI | null) => {
        if (comment)
            return (
                <ItemActionComment
                    showIf={!!comment}
                    showOrHideReply={this.props.showOrHideReply}
                />
            )
    };

    actionLike = (comment: SendMessageI, parent: ParentObj) => {
        if ("likes" in parent && comment) {

            if (comment.type !== "topic") {

                return (
                    <ItemActionLike
                        type={comment.type}
                        ownerId={comment.ownerId}
                        itemId={comment.id}
                        likes={(parent as ParentObjPost | TopicParFromComm).likes}
                        classPrefix="item"
                    />
                )
            }
            else return null;
        }
        else return null;
    };

    actionOpenLink = () => {
        const {item} = this.props;
        const link = getSourceLink(item.type, item.parent);

        return link
            ?
            <ItemAction
                onClick={_ => BrowserPu.createTab(link)}
                className="fa fa-external-link-square"
                title={I18N.get("Open in New Tab")}
            />
            : null
    };

    actionUnsubscribe = (actionsData: SendMessageI | null) => {
        return actionsData ?
            (
                <i
                    onClick={() => unsubscribe(actionsData.type, actionsData.ownerId, actionsData.id)}
                    title={Capitalize(I18N.get("unsubscribe"))}
                    className="item__action fa fa-ban"
                />
            )
            : null
    };

    render() {
        const {item, actionsData} = this.props;
        try {

            return (
                <ItemActions>

                    {this.actionUnsubscribe(actionsData)}
                    {this.actionOpenLink()}
                    {this.actionComment(actionsData)}
                    {this.actionLike(actionsData, item.parent)}

                </ItemActions>
            )
        }
        catch (e) {
            console.warn("Trouble in MyFeedbackActions for item", item, e);
            return null;
        }
    }
}

export default   MyFeedbackActions