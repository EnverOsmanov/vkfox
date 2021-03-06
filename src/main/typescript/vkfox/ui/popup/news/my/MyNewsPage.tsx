import * as React from "react"
import Mediator from "../../../../mediator/mediator.pu"
import {RouteComponentProps} from "react-router"
import {Msg} from "../../../../mediator/messages"
import FeedbackItem from "./FeedbackItem";
import {FeedbacksData} from "./types";
import {FeedbackItemObj} from "../types";
import Spinner from "../../components/loading/Spinner";


interface MyNewsProps extends RouteComponentProps<any> {
}

class MyNewsPage extends React.Component<MyNewsProps, FeedbacksData> {

    public readonly state: FeedbacksData = null;


    componentDidMount() {
        Mediator.sub(Msg.FeedbacksData, this.onFeedbacksData);
        Mediator.pub(Msg.FeedbacksDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.FeedbacksData);
    }

    onFeedbacksData = (data: FeedbacksData) => {
        this.setState(data)
    };

    newsElms = () => {
        const profiles = new Map(this.state.profiles);

        const singleNewsItem = (item: FeedbackItemObj) => {

            const itemProfile = profiles.get(Math.abs(item.parent.owner_id));

            return (
                <FeedbackItem
                    key={item.id}
                    item={item}
                    itemProfile={itemProfile}
                    profiles={new Map(profiles)}
                />
            )
        };


        return this.state.items.map(singleNewsItem)
    };

    componentDidCatch(error, info) {
        console.error("MyNewsPage")
        console.error(this.state)
    }

    render() {
        const withData = () => (
            <div className="item-list news_type_my">

                <div className="item-list__content">
                    <div className="item-list__scroll">

                        {this.newsElms()}

                    </div>
                </div>

            </div>
        );

        return this.state ? withData() : Spinner
    }
}

export default MyNewsPage