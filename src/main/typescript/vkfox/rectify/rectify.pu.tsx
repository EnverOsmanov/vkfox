import * as React from "react"
import I18N from '../i18n/i18n.pu';
import * as linkifyHtml from 'linkifyjs/html';
import * as sanitizeHtml from "sanitize-html";
import * as jEmoji from 'emoji';

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

    constructor(props) {
        super(props);

        this.state = {hideButton: false}
    }

    static showMoreButtonLabel = I18N.get('more...');


    showMore() {
        this.setState({ hideButton: true })
    }

    /**
     * Sanitize html with Angular's $sanitize.
     * Replaces all links with correspndenting anchors,
     * replaces next wiki format: [id12345|Dmitrii],
     * [id12345:bp_234567_1234|Dmitrii]
     * or [club32194285|Читать прoдoлжение..]
     * with <a anchor="http://vk.com/id12345">Dmitrii</a>
     * And repaces emoji unicodes with corrspondenting images
     *
     * @param {String} text
     * @param {Boolean} hasEmoji
     * @returns {String} html
     */
    static linkifySanitizeEmoji(text, hasEmoji) {
        const jEmojedText = hasEmoji
            ? jEmoji.unifiedToHTML(text)
            : text;

        const sanitized = sanitizeHtml(jEmojedText, {
            allowedTags: [ "br" ]
        });
        const linkifiedText = linkifyHtml(sanitized, {
                //"text" and "href" are safe tokens of the already sanitized string,
                //which is passed to the "linkify" function above
                callback: (text, href) => href ? '<a data-anchor="' + href + '">' + text + '</a>' : text
            });

        //replace wiki layout,
        //linkifiedText is a sanitized and linkified text
        return linkifiedText.replace(
            /\[((?:id|club)\d+)(?::bp-\d+_\d+)?\|([^\]]+)\]/g,
            '<a data-anchor="http://vk.com/$1">$2</a>'
        );
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
            const restOfText =  RectifyPu.escapeQuotes(text.slice(spaceIndex));
            const resultText = RectifyPu.linkifySanitizeEmoji(restOfText, hasEmoji);

            return <div dangerouslySetInnerHTML={{__html: resultText}} />
        }
        else
        return (
            <span
                className="show-more btn rectify__button"
                onClick={() => this.showMore()}>
                {RectifyPu.showMoreButtonLabel}
            </span>
        )
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
        let text = this.props.text;
        const hasEmoji = this.props.hasEmoji;

        if (text.length > MAX_TEXT_LENGTH) {
            const spaceIndex = text.indexOf(" ", TRUNCATE_LENGTH);

            if (spaceIndex !== -1) {
                const firstPartOfText = RectifyPu.linkifySanitizeEmoji(text.slice(0, spaceIndex), hasEmoji);

                return (
                    <div>
                        <div dangerouslySetInnerHTML={{__html: firstPartOfText}}/>
                        {this.buttonOrFullText(text, spaceIndex, hasEmoji)}
                    </div>
                );
            }
            else return <div dangerouslySetInnerHTML={{__html: RectifyPu.linkifySanitizeEmoji(text, hasEmoji)}}/>;
        }
        else {
            return <div dangerouslySetInnerHTML={{__html: RectifyPu.linkifySanitizeEmoji(text, hasEmoji)}}/>;
        }

    };
}

export default RectifyPu;
