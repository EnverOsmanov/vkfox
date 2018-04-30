import * as React from "react"
import Mediator from "../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import Msg from "../../../mediator/messages"
import Feeds from "./Feeds";
import {NewsfeedData} from "../../../../vk/types/newsfeed";


interface ChatState extends NewsfeedData {
}

interface ChatProps extends RouteComponentProps<any> {

}

class FriendNewsPage extends React.Component<ChatProps, ChatState> {

    constructor(props) {
        super(props);

        this.state = {
            profiles: [],
            items: []
        };
    }

    componentWillMount() {
        Mediator.sub(Msg.NewsfeedFriends, this.setState.bind(this));
        Mediator.pub(Msg.NewsfeedFriendsGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.NewsfeedFriends);
    }


    render() {

        return (
            <div className="item-list" id="fixed-header">

                <div className="item-list__content">
                    <div className="item-list__scroll">

                        <Feeds data={this.state}/>

                    </div>
                </div>

            </div>
        );
    }
}

export default FriendNewsPage