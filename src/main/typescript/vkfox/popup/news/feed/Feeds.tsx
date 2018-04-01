import * as React from "react"
import {ItemObj, NewsfeedData} from "../../../newsfeed/types";
import NewsFeedItem from "./NewsFeedItem";

interface FeedsProps {
    data: NewsfeedData
}

class Feeds extends React.Component<FeedsProps, undefined> {

    render() {

        const profiles = this.props.data.profiles;

        const singleFeedItem = (item: ItemObj) => {

            const owners = profiles.find(profile => profile.id === item.source_id);

            return owners
                ?
                <NewsFeedItem
                    key={item.id}
                    item={item}
                    owners={owners}
                    profiles={profiles}
                />
                : null
        };

        return (
            <div>
                {this.props.data.items.map(singleFeedItem)}
            </div>
        )
    }
}

export default Feeds