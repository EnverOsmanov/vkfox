import * as React from "react"


interface DescriptionI {
    description?: string
}

export const Description = (props: DescriptionI) => {
    return props.description
        ?
        <span className="item__description">
                {props.description}
            </span>
        : null
};