import * as React from "react"
import Mediator from "../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import Msg from "../../../mediator/messages"
import Feeds from "./Feeds";
import {NewsfeedData} from "../../../../vk/types/newsfeed";


interface ChatProps extends RouteComponentProps<any> {}

interface ChatState {
    data: NewsfeedData
}

class GroupNewsPage extends React.Component<ChatProps, ChatState> {

    constructor(props) {
        super(props);

        const data: NewsfeedData = {
            profiles: [],
            items: []
        };

        this.state = { data };
    }

    componentWillMount() {
        Mediator.sub(Msg.NewsfeedGroups, this.onNewsfeedData);
        Mediator.pub(Msg.NewsfeedGroupsGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.NewsfeedGroups);
    }

    onNewsfeedData = (data: NewsfeedData) => {
        this.setState( {data})
    };


    render() {
        return (
            <div className="item-list">

                <div className="item-list__content">
                    <div className="item-list__scroll">

                        <Feeds data={this.state.data}/>

                    </div>
                </div>

            </div>
        );
    }
}

export default GroupNewsPage