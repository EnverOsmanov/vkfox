import * as React from "react"
import NewsFeedItem from "./NewsFeedItem";
import {ItemObj, NewsfeedData} from "../../../../vk/types/newsfeed";

interface FeedsProps {
    data: NewsfeedData
}

class Feeds extends React.Component<FeedsProps, object> {

    render() {

        const {profiles, items} = this.props.data;

        const singleFeedItem = (item: ItemObj) => {

            const owner = profiles.find(profile => profile.id === Math.abs(item.source_id));

            if (owner) {
                return (
                    <NewsFeedItem
                        key={item.id}
                        item={item}
                        owner={owner}
                        profiles={profiles}
                    />
                )
            }
            else {
                console.warn("Owner not found for feed", item);
                return null
            }
        };

        return (
            <div>
                {items.map(singleFeedItem)}
            </div>
        )
    }
}

export default Feeds