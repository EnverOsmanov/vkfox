import * as React from "react"
import Mediator from "../../mediator/mediator.pu"

import {PuChatUserProfile, PuChatUserProfilesColl} from "../../chat/collections/ProfilesColl"
import {Collection} from "backbone"
import Msg from "../../mediator/messages";
import I18N from "../../i18n/i18n";
import DialogItem from "./dialog/DialogItem";
import {ChatDataI, DialogI} from "./types";
import {UserProfile} from "../../back/users/types";
import {Message} from "../../../vk/types";


interface ChatState {
    dialogs     : DialogI[]
    profilesColl: Collection<PuChatUserProfile>
}

class ChatPage extends React.Component<object, ChatState> {

    public readonly state = ChatPageCpn.initialState;

    componentWillMount() {
        Mediator.sub(Msg.ChatData, this.onChatData);
        Mediator.pub(Msg.ChatDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.ChatData);
    }

    private onChatData = ({dialogs, profiles}: ChatDataI) => {

        this.setState(prevState => {

                function mergeDialogs(bgDialog: DialogI): DialogI {
                    const maybeUiDialog = prevState.dialogs.find(d => d.id === bgDialog.id);

                    function mergeMessages() {
                        const onlyNewUimessages =
                            maybeUiDialog.messages
                                .filter(ui => !bgDialog.messages.some(bg => bg.id === ui.id));

                        bgDialog.messages =
                            bgDialog.messages
                                .concat(onlyNewUimessages)
                                .sort((a, b) => a.date - b.date);


                        return bgDialog
                    }

                    return maybeUiDialog
                        ? mergeMessages()
                        : bgDialog;
                }

                const mergedDialogs = dialogs.map(mergeDialogs);

                const mergedProfiles: PuChatUserProfile[] = prevState.profilesColl.toArray().concat(profiles);

                const profilesColl: Collection<PuChatUserProfile> =
                    new Collection(mergedProfiles, {model: PuChatUserProfile});

                return {
                    profilesColl,
                    dialogs: mergedDialogs
                }
            }
        );

    };

    private addToProfilesColl = (profiles: UserProfile[]) => {

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
        const {dialogs, profilesColl} = this.state;

        return dialogs.map( dialog =>
            <DialogItem
                key={dialog.id}
                dialog={dialog}
                profilesColl={profilesColl}
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

class ChatPageCpn {
    private static profilesColl = new PuChatUserProfilesColl();

    static initialState = {
        dialogs     : [],
        profilesColl: ChatPageCpn.profilesColl
    };
}