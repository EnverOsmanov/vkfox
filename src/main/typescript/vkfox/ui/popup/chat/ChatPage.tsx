import * as React from "react"
import Mediator from "../../../mediator/mediator.pu"
import {Msg} from "../../../mediator/messages";
import I18N from "../../../common/i18n/i18n";
import DialogItem from "./dialog/DialogItem";
import {ChatDataI} from "./types";
import {GroupProfile, UserProfile} from "../../../common/users/types";
import {Message} from "../../../../vk/types";
import {ChatUserProfileI, DialogI} from "../../../common/chat/types";


interface ChatState {
    dialogs     : DialogI[]
    profilesColl: ChatUserProfileI[]
    groupsColl: GroupProfile[]
}

class ChatPage extends React.Component<object, ChatState> {

    public readonly state = ChatPageCpn.initialState;

    componentDidMount() {
        Mediator.sub(Msg.ChatData, this.onChatData);
        Mediator.pub(Msg.ChatDataGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.ChatData);
    }

    private onChatData = ({dialogs, profiles, groups}: ChatDataI) => {

        this.setState(prevState => {

                function mergeDialogs(bgDialog: DialogI): DialogI {
                    const maybeUiDialog = prevState.dialogs.find(d => d.peer_id === bgDialog.peer_id);

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

                const profilesColl: UserProfile[] = prevState.profilesColl.concat(profiles);
                const groupsColl: GroupProfile[] = prevState.groupsColl.concat(groups);

                return {
                    groupsColl,
                    profilesColl,
                    dialogs: mergedDialogs
                }
            }
        );

    };

    private addToProfilesColl = (profiles: UserProfile[]) => {

        this.setState(prevState => {
            const profilesColl = prevState.profilesColl.concat(profiles);

            return {
                ...prevState,
                profilesColl
            }
        })
    };

    private addToGroupsColl = (profiles: GroupProfile[]) => {

        this.setState(prevState => {
            const groupsColl = prevState.groupsColl.concat(profiles);

            return {
                ...prevState,
                groupsColl
            }
        })
    };

    private addToMessages = (dialogId: number, messages: Message[]) => {

        this.setState(prevState => {
            const dialogs = prevState.dialogs.slice();
            const i = prevState.dialogs.findIndex( dialog => dialog.peer_id == dialogId);

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
        const {dialogs, profilesColl, groupsColl} = this.state;

        return dialogs.map( dialog =>
            <DialogItem
                key={dialog.peer_id}
                dialog={dialog}
                profilesColl={profilesColl}
                groupsColl={groupsColl}
                addToProfilesColl={this.addToProfilesColl}
                addToGroupsColl={this.addToGroupsColl}
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

    static initialState: ChatState = {
        dialogs     : [],
        profilesColl: [],
        groupsColl: []
    };
}