import * as React from "react"
import Mediator from "../../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import {Msg} from "../../../../mediator/messages"
import Feeds from "./Feeds";
import {NewsfeedData} from "../../../../../vk/types/newsfeed";


interface ChatProps extends RouteComponentProps<any> {}

interface ChatState {
    data: NewsfeedData
}

class GroupNewsPage extends React.Component<ChatProps, ChatState> {

    public readonly state = GroupsNewsPageCpn.initialState;

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

                <Feeds data={this.state.data}/>

            </div>
        );
    }
}

export default GroupNewsPage


class GroupsNewsPageCpn {

    private static data: NewsfeedData = {
        profiles: [],
        items: []
    };

    static initialState: ChatState =
        { data: GroupsNewsPageCpn.data };

}