import * as React from "react"
import I18N from "../../i18n/i18n";
import Checkbox from "../checkbox/Checkbox";
import * as $ from "jquery"
import {BuddiesFilters} from "./types";


(window as any).jQuery = $;
require('bootstrap/js/dropdown.js');

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
                className="dropdown buddies__filter pull-right">
                <i
                    className="fa fa-bars dropdown-toggle"
                    data-toggle="dropdown"
                />

                <ul className="dropdown-menu">
                    <li>
                        <Checkbox
                            className="buddies__checkbox"
                            isChecked={male}
                            filterName="male"
                            onToggle={this.props.handleFilter}>
                            {I18N.get("Male")}
                        </Checkbox>
                    </li>

                    <li>
                        <Checkbox
                            className="buddies__checkbox"
                            isChecked={female}
                            filterName="female"
                            onToggle={this.props.handleFilter}>
                            {I18N.get("Female")}
                        </Checkbox>
                    </li>

                    <li className="divider"/>

                    <li>
                        <Checkbox
                            className="buddies__checkbox"
                            isChecked={offline}
                            filterName="offline"
                            onToggle={this.props.handleFilter}>

                            {I18N.get("Offline")}
                        </Checkbox>
                    </li>

                    <li className="divider"/>

                    <li>
                        <Checkbox
                            className="buddies__checkbox"
                            isChecked={faves}
                            filterName="faves"
                            onToggle={this.props.handleFilter}>
                            {I18N.get("Bookmarked")}
                        </Checkbox>
                    </li>

                </ul>

            </div>
        )
    }
    
}

export default BuddiesSearchMenu;