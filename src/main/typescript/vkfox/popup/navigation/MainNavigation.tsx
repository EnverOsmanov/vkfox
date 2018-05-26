
import {BrowserRouter as Router, Link, NavLink, Route, Switch} from 'react-router-dom'
import {Redirect, withRouter} from "react-router"
import * as React from "react"
import ChatPage from "../chat/ChatPage";
import BuddiesPage from "../buddy/Buddies";
import {addVKBase} from "../filters/filters.pu";
import SettingsPage from "../settings/SettingsPage";
import I18N from "../../i18n/i18n";
import PersistentModel from "../../persistent-model/persistent-model";
import NewsPage from "../news/NewsPage";
import Mediator from '../../mediator/mediator.pu'
import Msg from "../../mediator/messages";
import {AuthState} from "../../back/auth/models";
import Browser from '../../browser/browser.pu'
import {VKNotificationI} from "../../notifications/Notification";
import Resizer from "../resize/Resizer";



class MainNavigation extends React.Component {

    static model = new PersistentModel(
        {lastPath: '/chat'},
        {name: 'router'}
    );

    constructor(props) {
        super(props);
        
        Mediator.pub(Msg.AuthStateGet);
        Mediator.pub(Msg.NotificationsQueueGet);
    }

    tabs = ["chat", "news", "buddies"];

    tabLinks = this.tabs.map(tab =>
        <NavLink
            key={tab}
            className="navbar__tab"
            activeClassName="navbar__tab_active"
            to={`/${tab}`}>
            {I18N.get(tab)}
        </NavLink>
    );


    render() {
        const lastPath = MainNavigation.model.get('lastPath');


        return (
            <Router>
                <div>
                    <NotificationRouter />
                    <div className="navigation navbar navbar_style_main">
                        {this.tabLinks}

                        <div className="navigation__actions">
                            <div data-anchor={addVKBase("/vkfoxy")}
                                  className="navigation__action navigation__help">
                                <i className="fa fa-bug"/>
                            </div>
                            <Link to="/settings"
                                  className="navigation__action navigation__settings">
                                <i className="fa fa-cog"/>
                            </Link>
                        </div>
                    </div>

                    <Switch>
                        <Route path="/chat" component={ChatPage}/>
                        <Route path="/news" component={NewsPage}/>
                        <Route path="/buddies" component={BuddiesPage}/>
                        <Route path="/settings" component={SettingsPage}/>
                        <Redirect from="/" to={lastPath}/>
                    </Switch>
                    <Resizer/>
                </div>
            </Router>
        )
    }
}

export default MainNavigation

const NotificationRouter = withRouter(props => {

        props.history.listen(location => {
            Mediator.pub(Msg.RouterChange, location.pathname);
            Mediator.pub(Msg.RouterLastPathPut, location.pathname);
            MainNavigation.model.set("lastPath", location.pathname);
        });

        const  notificationsPromise: Promise<VKNotificationI[]> = new Promise(resolve => Mediator.sub(Msg.NotificationsQueue, resolve));
        const authPromise: Promise<AuthState> = new Promise( resolve => Mediator.sub(Msg.AuthState, resolve) );


        Promise.all([notificationsPromise, authPromise])
            .then(([queue, state]) => {


                if (state === AuthState.READY) {
                    if (queue.length) {
                        // queue contains updates from tabs.
                        // Property 'type' holds value
                        const pathOfNotification = '/' + queue[queue.length - 1].type;
                        if (props.location.pathname !== pathOfNotification) {
                            props.history.replace(pathOfNotification);
                        }
                    }
                }
            });

        authPromise.then((state) => {
            if (state !== AuthState.READY) {
                Mediator.pub(Msg.AuthOauth);
                Browser.closePopup();
            }
        });
        return null
    }
);