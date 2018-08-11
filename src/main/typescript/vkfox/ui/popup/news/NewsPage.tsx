import * as React from "react"
import {Redirect, Route, RouteComponentProps, Switch} from "react-router"
import I18N from "../../../common/i18n/i18n";
import {ForceOnlineSettingsI, NotificationsSettingsI} from "../../../notifications/types";
import {NavLink} from "react-router-dom";
import MyNewsPage from "./my/MyNewsPage";
import FriendNewsPage from "./feed/FriendNewsPage";
import GroupNewsPage from "./feed/GroupsNewsPage";
import {ReplyI} from "../chat/types";

interface RouterTab {
    href: string
    text: string
}


interface ChatProps extends RouteComponentProps<any> {
    reply: ReplyI
}

interface SettingsState {
    notifications: NotificationsSettingsI
    forceOnline: ForceOnlineSettingsI
}

class NewsPage extends React.Component<ChatProps, SettingsState> {

    tabs: RouterTab[] = [
        {
            href: 'my',
            text: 'my'
        },
        {
            href: 'friends',
            text: 'friends_nominative'
        },
        {
            href: 'groups',
            text: 'groups_nominative'
        }
    ];

    tabLinks = this.tabs.map(tab => {

            const pageLink = `${this.props.match.url}/${tab.href}`;

            return (
                <NavLink
                    key={tab.text}
                    to={pageLink}
                    className="navbar__tab"
                    activeClassName="navbar__tab_active">
                    {I18N.get(tab.text)}
                </NavLink>
            )
        }
    );


    render() {
        const match = this.props.match;

        return (
            <div className="news">
                <div className="navbar navbar_style_sub">
                    {this.tabLinks}
                </div>

                <Switch>
                    <Route path={`${match.url}/my`} component={MyNewsPage}/>
                    <Route path={`${match.url}/friends`} component={FriendNewsPage}/>
                    <Route path={`${match.url}/groups`} component={GroupNewsPage}/>
                    <Redirect from={`${match.url}`} to={`${match.url}/my`}/>
                </Switch>
            </div>
        );
    }
}

export default NewsPage