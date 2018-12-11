import * as React from 'react';
import {ReplyI} from "../../chat/types";

interface ReplyMessageP {
    reply      : ReplyI
    message    : string

    sendMessage        : () => void
    handleMessageChange: (event) => void
}

class ReplyMessage extends React.Component<ReplyMessageP, object> {

    handleMessageChange = (event) => {
        const message = event.target.value;
        this.props.handleMessageChange(message)
    };

    handleKeyPress = (event: React.KeyboardEvent<any>) => {
        if (event.key == "Enter") this.props.sendMessage()
    };

    render() {
        const {reply, message} = this.props;

        return reply.visible
            ?
            <div className="item__reply">
                <textarea
                    autoFocus={true}
                    onKeyPress={this.handleKeyPress}
                    value={message}
                    onChange={this.handleMessageChange}
                />
            </div>
            : null
    }
}

export default ReplyMessage;