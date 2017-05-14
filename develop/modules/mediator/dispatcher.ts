"use strict";
import * as _ from "underscore";
import * as Backbone from 'backbone';
import {Events} from "backbone";

interface IEventEmitter extends Events {
    emit(event: string, ...args: any[]);
}

function _EventEmitter() {}
_EventEmitter.prototype = Events;
_EventEmitter.prototype.emit = (Events as any).trigger;
export const EventEmitter: new() => IEventEmitter
    = _EventEmitter as any as new() => IEventEmitter;

class Foo extends EventEmitter {

}

const dispatcher = new Foo();

export default {
    pub: function (eventName: string, ...args: any[]) {
        dispatcher.trigger(eventName, ...args);
    },
    sub: function (eventName: string, callback?: Function, context?: any) {
        dispatcher.on(eventName, callback, context);
    },
    once: function (events: string, callback: Function, context?: any) {
        dispatcher.once(events, callback, context);
    },
    unsub: function (eventName?: string, callback?: Function, context?: any) {
        dispatcher.off(eventName, callback, context);
    }
};
