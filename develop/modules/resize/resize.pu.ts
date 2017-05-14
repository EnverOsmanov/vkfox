"use strict";
import PersistentModel from '../persistent-model/persistent-model';
import * as _ from "underscore";
import * as Angular from 'angular';
import * as $ from "jquery";

const MOVE_DEBOUCE    = 10,
    DEFAULT_WIDTH     = 320,
    MAX_WIDTH         = 640,
    MIN_WIDTH         = 230,
    DEFAULT_HEIGHT    = 480,
    MAX_HEIGHT        = 600,
    MIN_HEIGHT        = 375,
    DEFAULT_FONT_SIZE = 12,
    root              = $('body');

const model = new PersistentModel({
    width   : DEFAULT_WIDTH,
    height  : DEFAULT_HEIGHT,
    fontSize: DEFAULT_FONT_SIZE
}, {name: 'resize'});

function resizePu() {

    let screenX, screenY;
    const dragMove = _.debounce(function (e) {
        const dx = screenX - e.screenX;
        const dy = -screenY + e.screenY;

        screenX = e.screenX;
        screenY = e.screenY;

        const width = Math.max(
            MIN_WIDTH,
            Math.min(MAX_WIDTH, model.get('width') + dx)
        );
        const height = Math.max(
            MIN_HEIGHT,
            Math.min(MAX_HEIGHT, model.get('height') + dy)
        );
        const fontSize = DEFAULT_FONT_SIZE + Math.round(
                (width / DEFAULT_WIDTH - 1) * DEFAULT_FONT_SIZE / 2
            );
        model.set('width', width);
        model.set('height', height);
        model.set('fontSize', fontSize);
        root.css(model.toJSON());
    }, MOVE_DEBOUCE);

    function dragStart(e) {
        root
            .addClass('resize__active')
            .on('mousemove', dragMove)
            .on('mouseup mouseleave', dragEnd);
        screenX = e.screenX;
        screenY = e.screenY;
    }
    function dragEnd() {
        root
            .removeClass('resize__active')
            .off('mouseup mouseleave', dragEnd)
            .off('mousemove', dragMove);
    }


    return {
        template  : '<div class="resize"><div class="resize__handle"></div></div>',
        transclude: false,
        restrict  : 'E',
        scope     : false,
        replace   : true,
        link      : (scope, iElement) => iElement.bind('mousedown', dragStart)
    };
}

export default function init() {
    Angular.module('app').directive('resize', resizePu)
}
