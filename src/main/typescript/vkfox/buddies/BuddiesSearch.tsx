import * as React from "react"
import I18N from "../i18n/i18n";
import BuddiesSearchMenu from "./BuddiesSearchMenu";
import {BuddiesFilters} from "./types";

interface BuddiesSearchProps {
    searchInput : string
    filters: BuddiesFilters

    onSearchChange(e: React.FormEvent<HTMLInputElement>): void
    handleFilter(filterName: string, filterValue: boolean): void
}

class BuddiesSearch extends React.Component<BuddiesSearchProps, undefined> {

    render() {
        return (
            <div className="navbar navbar_style_sub">

                <label className="buddies__search">

                    <i className="fa fa-search" />

                    <input
                        className="span2"
                        placeholder={I18N.get("Search")}
                        value={this.props.searchInput}
                        onChange={this.props.onSearchChange}
                    />

                </label>

                <BuddiesSearchMenu
                    filters={this.props.filters}
                    handleFilter={this.props.handleFilter}
                />

            </div>
        )
    }

}

export default BuddiesSearch;