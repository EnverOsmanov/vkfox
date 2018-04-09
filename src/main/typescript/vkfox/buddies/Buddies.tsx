import * as React from "react"
import Mediator from "../mediator/mediator.pu"
import Msg from "../mediator/messages"
import {buddiesFilter, initBuddiesFilter} from "./buddies.pu"
import BuddyItem from "../popup/buddy/BuddyItem";
import BuddiesSearch from "./BuddiesSearch";
import {BuddiesFilters} from "./types";
import ItemList from "../popup/item-list/ItemList";
import {ProfileI} from "../chat/types";



interface BuddiesState {
    searchInput : string
    filters     : BuddiesFilters
    data        : ProfileI[]
}

class BuddiesPage extends React.Component<undefined, BuddiesState> {

    static filtersModel = initBuddiesFilter();

    constructor(props) {
        super(props);

        const filters = BuddiesPage.filtersModel.toJSON();

        this.state = {
            data        : [],
            searchInput : "",
            filters
        };
    }

    componentWillMount() {
        Mediator.sub(Msg.BuddiesData, this.onBuddiesData);
        Mediator.pub(Msg.BuddiesDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.BuddiesData);
    }

    onBuddiesData = (data: ProfileI[]) => {
        this.setState(prevState => {
            return {
                ...prevState,
                data
            }
        })
    };

    toggleFriendWatching = (oldProfile: ProfileI) => {
        this.setState( prevState => {
            const data = prevState.data.slice();
            const i = prevState.data.findIndex( profile => profile.uid == oldProfile.uid);

            const prevProfile = data[i];
            data[i] = {
                ...prevProfile,
                isWatched: !oldProfile.isWatched
            };

            return {
                ...prevState,
                data
            }
        });

        Mediator.pub(Msg.BuddiesWatchToggle, oldProfile.uid);
    };

    onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        const searchInput = e.currentTarget.value;

        this.setState( prevState => {
            return {
                ...prevState,
                searchInput
            }
        })
    };

    handleFilter = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {

            const filters = {
                ...prevState.filters
            };
            filters[filterName] = filterValue;

            BuddiesPage.filtersModel.set(filters);

            return {
                ...prevState,
                filters
            }
        })
    };

    buddieItem = (buddie: ProfileI) => {
        return (
           <BuddyItem
               key={buddie.uid}
               buddie={buddie}
               toggleFriendWatching={() => this.toggleFriendWatching(buddie)}
           />
        )
    };

    items = () => {
        const searchInput = this.state.searchInput;
        const profiles = this.state.data;
        const filters = this.state.filters;

        return buddiesFilter(profiles, filters, searchInput)
            .map(this.buddieItem);
    };


    render() {
        return (
            <div className="buddies">

                <BuddiesSearch
                    searchInput={this.state.searchInput}
                    filters={this.state.filters}
                    onSearchChange={this.onSearchChange}
                    handleFilter={this.handleFilter}
                />

                <ItemList>
                    {this.items()}
                </ItemList>

            </div>
        );
    }
}

export default BuddiesPage