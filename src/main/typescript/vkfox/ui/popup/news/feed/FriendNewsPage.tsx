import * as React from "react"
import Mediator from "../../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import {Msg} from "../../../../mediator/messages"
import Feeds from "./Feeds";
import {NewsfeedData} from "../../../../back/newsfeed/types";


interface ChatState extends NewsfeedData {
}

interface ChatProps extends RouteComponentProps<any> {

}

class FriendNewsPage extends React.Component<ChatProps, ChatState> {

    public readonly state = {
        profiles: [],
        items: []
    };

    componentDidMount() {
        Mediator.sub(Msg.NewsfeedFriends, this.setState.bind(this));
        Mediator.pub(Msg.NewsfeedFriendsGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.NewsfeedFriends);
    }


    render() {

        return (
            <div className="item-list" id="fixed-header">
                <Feeds data={this.state}/>
            </div>
        );
    }
}

export default FriendNewsPage