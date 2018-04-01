import * as React from "react"
import Mediator from "../mediator/mediator.pu"

import {Profile, ProfileI, ProfilesColl} from "./collections/ProfilesColl"
import {ChatDataI, DialogI, Message} from "./collections/DialogColl"
import {Collection} from "backbone"
import Msg from "../mediator/messages";
import I18N from "../i18n/i18n";
import DialogItem from "../popup/chat/dialogActions/DialogItem";


export interface ReplyI {
    visible     : boolean
}


interface ChatState {
    dialogs     : DialogI[]
    profilesColl: Collection<Profile>
}

class ChatPage extends React.Component<undefined, ChatState> {

    constructor(props) {
        super(props);

        const profilesColl = new ProfilesColl();

        this.state = {
            dialogs: [],
            profilesColl
        };
    }

    componentWillMount() {
        Mediator.sub(Msg.ChatData, this.onChatData);
        Mediator.pub(Msg.ChatDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.ChatData);
    }

    private onChatData = ({dialogs, profiles}: ChatDataI) => {

        const profilesColl: Collection<Profile> = new Collection<Profile>(profiles, {model: Profile});

        this.setState(prevState => {
                return {
                    ...prevState,
                    dialogs,
                    profilesColl
                }
            }
        );

    };

    private addToProfilesColl = (profiles: ProfileI[]) => {

        this.setState(prevState => {
            prevState.profilesColl.add(profiles);

            return prevState
        })
    };

    private addToMessages = (dialogId: string, messages: Message[]) => {

        this.setState(prevState => {
            const dialogs = prevState.dialogs.slice();
            const i = prevState.dialogs.findIndex( dialog => dialog.id == dialogId);

            const prevDialog = dialogs[i];
            dialogs[i] = {
                ...prevDialog,
                messages
            };

            return {
                ...prevState,
                dialogs
            }
        })
    };

    static markAsReadTitle(out: boolean) {
        const title = out
            ? "Your message wasn\'t read"
            : "Mark as read";

        return I18N.get(title)
    }

    dialogElms = () => {
        return this.state.dialogs.map( dialog =>
            <DialogItem
                key={dialog.uid}
                dialog={dialog}
                profilesColl={this.state.profilesColl}
                addToProfilesColl={this.addToProfilesColl}
                addToMessages={this.addToMessages}
            />
        )
    };

    render() {
        return (
            <div className="item-list chat">
                <div className="item-list__content">
                    <div className="item-list__scroll">
                        {this.dialogElms()}
                    </div>
                </div>

            </div>
        );
    }
}

export default ChatPage