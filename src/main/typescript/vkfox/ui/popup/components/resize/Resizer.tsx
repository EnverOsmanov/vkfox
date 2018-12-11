import * as React from "react"
import PersistentModel from "../../../../common/persistent-model/persistent-model";


const DEFAULT_WIDTH   = 320,
    DEFAULT_HEIGHT    = 480,
    DEFAULT_FONT_SIZE = 12;


const model = new PersistentModel({
    width   : DEFAULT_WIDTH,
    height  : DEFAULT_HEIGHT,
    fontSize: DEFAULT_FONT_SIZE
}, {name: 'resize'});


class Resizer extends React.Component {

    render() {

        return (
            <div className="resize">
                <div
                    className="resize__handle"
                    onMouseDown={initDrag}
                />
            </div>
        )
    }
}

export default Resizer

const body = document.querySelector("body");

let startX: number,
    startY: number,
    startWidth: number,
    startHeight: number;

function initDrag(e: React.MouseEvent<any>) {
    startX = e.screenX;
    startY = e.screenY;
    startWidth = parseInt(document.defaultView.getComputedStyle(body).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(body).height, 10);
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
}

function doDrag(e: MouseEvent) {
    body.style.width = (startWidth - (e.screenX - startX)) + 'px';
    body.style.height = (startHeight + (e.screenY - startY)) + 'px';
}

function stopDrag(__) {
    model.set('width', parseInt(body.style.width));
    model.set('height', parseInt(body.style.height));
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);
}
