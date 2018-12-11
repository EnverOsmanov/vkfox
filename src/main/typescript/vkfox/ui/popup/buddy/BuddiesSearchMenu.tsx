import * as React from "react"
import I18N from "../../../common/i18n/i18n";
import Checkbox from "../components/checkbox/Checkbox";
import * as $ from "jquery"
import {BuddiesFilters} from "./types";


(window as any).jQuery = $;
import "bootstrap/js/dist/dropdown.js";

interface BuddiesSearchMenuProps {
    filters: BuddiesFilters

    handleFilter(filterName: string, filterValue: boolean): void
}

class BuddiesSearchMenu extends React.Component<BuddiesSearchMenuProps, object> {
    render() {
        const {male, female, offline, faves} = this.props.filters;

        return (
            <div
                role="menu"
                className="dropdown buddies__filter">
                <i
                    className="fa fa-bars"
                    data-toggle="dropdown"
                />

                <ul className="dropdown-menu dropdown-menu-right">
                    <Checkbox
                        className="buddies__checkbox"
                        isChecked={male}
                        filterName="male"
                        onToggle={this.props.handleFilter}>
                        {I18N.get("Male")}
                    </Checkbox>

                    <Checkbox
                        className="buddies__checkbox"
                        isChecked={female}
                        filterName="female"
                        onToggle={this.props.handleFilter}>
                        {I18N.get("Female")}
                    </Checkbox>

                    <li className="dropdown-divider"/>

                    <Checkbox
                        className="buddies__checkbox"
                        isChecked={offline}
                        filterName="offline"
                        onToggle={this.props.handleFilter}>

                        {I18N.get("Offline")}
                    </Checkbox>

                    <li className="dropdown-divider"/>

                    <Checkbox
                        className="buddies__checkbox"
                        isChecked={faves}
                        filterName="faves"
                        onToggle={this.props.handleFilter}>
                        {I18N.get("Bookmarked")}
                    </Checkbox>

                </ul>

            </div>
        )
    }
    
}

export default BuddiesSearchMenu;