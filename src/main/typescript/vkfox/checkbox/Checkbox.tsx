import * as React from "react"


interface CheckboxProps {
    className   : string
    isChecked   : boolean
    filterName  : string
    isDisabled ?: boolean

    onToggle(filterName: string, filterValue: boolean): void
}


class Checkbox extends React.Component<CheckboxProps> {

    onChange = () => {
        this.props.onToggle(this.props.filterName, !this.props.isChecked)
    };

    render(){

        return(
            <label className={`checkbox ${this.props.className}`}>
                <input
                    className="checkbox__input"
                    type="checkbox"
                    checked={this.props.isChecked}
                    onChange={this.onChange}
                />
                <div className="checkbox__text">
                    {this.props.children}
                </div>
            </label>
        )
    }

}

export default Checkbox