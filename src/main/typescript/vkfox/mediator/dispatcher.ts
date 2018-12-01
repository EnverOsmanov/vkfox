"use strict";
import {Events} from "backbone";

interface IEventEmitter extends Events {
    emit(event: string, ...args: any[]);
}

function _EventEmitter() {}
_EventEmitter.prototype = Events;
//_EventEmitter.prototype.emit = (Events as any).trigger;
export const EventEmitter: new() => IEventEmitter
    = _EventEmitter as any as new() => IEventEmitter;

class Foo extends EventEmitter {

}

const dispatcher = new Foo();

class Dispatcher {

    static pub(eventName: string, ...args: any[]) {
        dispatcher.trigger(eventName, ...args);
    }

    static sub(eventName: string, callback?: (...args: any[]) => void, context?: any) {
        dispatcher.on(eventName, callback, context);
    }

    static once(events: string, callback?: (...args: any[]) => void, context?: any) {
        dispatcher.once(events, callback, context);
    }

    static unsub(eventName?: string, callback?: (...args: any[]) => void, context?: any) {
        dispatcher.off(eventName, callback, context);
    }
}

export default Dispatcher;
