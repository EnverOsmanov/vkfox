import * as React from "react"
import * as ReactDOMServer from 'react-dom/server'
import I18N from '../common/i18n/i18n.pu';
import BrowserPu from "../browser/browser.pu";
import {linkifySanitizeEmoji} from "./helpers";

interface RectifyPuProps {
    text    : string
    hasEmoji: boolean;
}

interface RectifyPuState {
    hideButton: boolean
}

const MAX_TEXT_LENGTH = 300,
    TRUNCATE_LENGTH = 200;

class RectifyPu extends React.Component<RectifyPuProps, RectifyPuState>{

    public readonly state = {hideButton: false};

    static showMoreButtonLabel = I18N.get('more...');


    showMore() {
        this.setState({ hideButton: true })
    }

    static createTab(href: string, text: string):string {
        return ReactDOMServer.renderToStaticMarkup(<a onClick={_ => BrowserPu.createTab(href)}>{text}</a>)
    }

    static escapeQuotes(string) {
        const entityMap = {
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(string).replace(/["']/g, s => entityMap[s] );
    }

    buttonOrFullText = (text: string, spaceIndex: number, hasEmoji: boolean) => {
        if (this.state.hideButton) {
            const resultText = linkifySanitizeEmoji(text, hasEmoji, RectifyPu.createTab);

            return (
                <div
                    className="news__post news__item-text"
                    dangerouslySetInnerHTML={{__html: resultText}}
                />
            )
        }
        else {
            const firstPartOfText = linkifySanitizeEmoji(text.slice(0, spaceIndex), hasEmoji, RectifyPu.createTab);

            return (
                <div className="news__post">
                    <div
                        className="news__item-text"
                        dangerouslySetInnerHTML={{__html: firstPartOfText}}
                    />

                    <span className="show-more btn rectify__button"
                          onClick={() => this.showMore()}
                    >{RectifyPu.showMoreButtonLabel}
                    </span>
                </div>
            )
        }

    };

    /**
     * Truncates long text, and add pseudo-link "show-more"
     * Replaces text links and next wiki format: [id12345|Dmitrii]
     * with <a anchor="http://vk.com/id12345">Dmitrii</a>
     * And repaces emoji unicodes with corrspondenting images
     *
     * @param {String} text
     * @param {Boolean} hasEmoji If true, then we need to replace missing unicodes with images
     *
     * @returns {String} html-string
     */
    render() {
        const text = this.props.text;
        const hasEmoji = this.props.hasEmoji;

        if (text.length > MAX_TEXT_LENGTH) {
            const spaceIndex = text.indexOf(" ", TRUNCATE_LENGTH);

            if (spaceIndex !== -1) {
                return this.buttonOrFullText(text, spaceIndex, hasEmoji);
            }
            else return <div
                className="news__post news__item-text"
                dangerouslySetInnerHTML={{__html: linkifySanitizeEmoji(text, hasEmoji, RectifyPu.createTab)}}
            />;
        }
        else if (text) {
            return <div
                className="news__post news__item-text"
                dangerouslySetInnerHTML={{__html: linkifySanitizeEmoji(text, hasEmoji, RectifyPu.createTab)}}
            />;
        }
        else return null;

    };
}

export default RectifyPu;
