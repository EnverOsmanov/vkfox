import * as React from "react"
import NewsFeedItem from "./NewsFeedItem";
import {ItemObj, NewsfeedData} from "../../../../vk/types/newsfeed";

interface FeedsProps {
    data: NewsfeedData
}

class Feeds extends React.Component<FeedsProps, undefined> {

    render() {

        const {profiles, items} = this.props.data;

        const singleFeedItem = (item: ItemObj) => {

            const owners = profiles.find(profile => profile.id === Math.abs(item.source_id));

            return owners
                ?
                <NewsFeedItem
                    key={item.id}
                    item={item}
                    owner={owners}
                    profiles={profiles}
                />
                : null
        };

        return (
            <div>
                {items.map(singleFeedItem)}
            </div>
        )
    }
}

export default Feeds