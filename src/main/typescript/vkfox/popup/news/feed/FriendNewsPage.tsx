import * as React from "react"
import Mediator from "../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import Msg from "../../../mediator/messages"
import Feeds from "./Feeds";
import {NewsfeedData} from "../../../newsfeed/types";


interface ChatState {
    data: NewsfeedData
}

interface ChatProps extends RouteComponentProps<any> {

}

class FriendNewsPage extends React.Component<ChatProps, ChatState> {

    constructor(props) {
        super(props);

        const data = {
            profiles: [],
            items: []
        };

        this.state = { data };
    }

    componentWillMount() {
        Mediator.sub(Msg.NewsfeedFriends, this.onNewsfeedData);
        Mediator.pub(Msg.NewsfeedFriendsGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.NewsfeedFriends);
    }

    componentDidMount() {
    }

    onNewsfeedData = (data) => {
        this.setState(  {data})
    };


    render() {

        return (
            <div className="item-list" id="fixed-header">

                <div className="item-list__content">
                    <div className="item-list__scroll">

                        <Feeds data={this.state.data}/>

                    </div>
                </div>

            </div>
        );
    }
}

export default FriendNewsPage