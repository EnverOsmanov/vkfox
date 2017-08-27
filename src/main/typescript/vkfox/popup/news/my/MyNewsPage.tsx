import * as React from "react"
import Mediator from "../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import Msg from "../../../mediator/messages"
import {FeedbacksData, ItemObj} from "../../../feedbacks/collections/ItemColl";
import FeedbackItem from "./FeedbackItem";


interface ChatProps extends RouteComponentProps<any> {}

interface ChatState {
    data: FeedbacksData
}

class MyNewsPage extends React.Component<ChatProps, ChatState> {

    constructor(props) {
        super(props);

        const profilesColl = {
            profiles: [],
            items: []
        };

        this.state = {
            data: profilesColl
        };
    }

    componentWillMount() {
        Mediator.sub(Msg.FeedbacksData, this.onFeedbacksData);
        Mediator.pub(Msg.FeedbacksDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.FeedbacksData);
    }

    onFeedbacksData = (data: FeedbacksData) => {
        this.setState({data})
    };

    newsElms = () => {
        const profiles = this.state.data.profiles;

        const singleNewsItem = (item: ItemObj) => {

            const itemProfile = profiles.find(profile => profile.id === item.parent.owner_id);

            return (
                <FeedbackItem
                    key={item.id}
                    item={item}
                    itemProfile={itemProfile}
                    profiles={profiles}
                />
            )
        };


        return this.state.data.items.map(singleNewsItem)
    };

    render() {
        return (
            <div className="item-list news_type_my">

                <div className="item-list__content">
                    <div className="item-list__scroll">

                        {this.newsElms()}

                    </div>
                </div>

            </div>
        );
    }
}

export default MyNewsPage