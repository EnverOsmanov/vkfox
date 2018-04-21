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
        const {filterName, isChecked} = this.props;

        this.props.onToggle(filterName, !isChecked)
    };

    render(){
        const {className, children} = this.props;

        return(
            <label className={`checkbox ${className}`}>
                <input
                    className="checkbox__input"
                    type="checkbox"
                    checked={this.props.isChecked}
                    onChange={this.onChange}
                />
                <div className="checkbox__text">
                    {children ? children : ""}
                </div>
            </label>
        )
    }

}

export default Checkbox