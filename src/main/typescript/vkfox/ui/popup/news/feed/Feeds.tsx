import * as React from "react"
import NewsFeedItem from "./NewsFeedItem";
import {ItemObj} from "../../../../../vk/types/newsfeed";
import {idMaker} from "../../../../common/feedbacks/id";
import {NewsfeedData} from "../../../../back/newsfeed/types";

interface FeedsProps {
    data: NewsfeedData
}

class Feeds extends React.Component<FeedsProps, object> {

    render() {

        const {profiles, items} = this.props.data;

        const singleFeedItem = (item: ItemObj) => {

            return (
                <NewsFeedItem
                    key={idMaker(item)}
                    item={item}
                    profiles={new Map(profiles)}
                />
            )
        };

        return (
            <div className="item-list__content">
                <div className="item-list__scroll">
                    {items.map(singleFeedItem)}
                </div>
            </div>
        )
    }
}

export default Feeds