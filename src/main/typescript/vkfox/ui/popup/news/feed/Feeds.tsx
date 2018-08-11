import * as React from "react"
import NewsFeedItem from "./NewsFeedItem";
import {ItemObj, NewsfeedData} from "../../../../../vk/types/newsfeed";

interface FeedsProps {
    data: NewsfeedData
}

class Feeds extends React.Component<FeedsProps, object> {

    render() {

        const {profiles, items} = this.props.data;

        const singleFeedItem = (item: ItemObj) => {

            return (
                <NewsFeedItem
                    key={item.id}
                    item={item}
                    profiles={profiles}
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