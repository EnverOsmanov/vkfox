"use strict";

export default class PersistentSetBg {
    private item: string = null
    private _name: string = null;

    constructor(name: string) {
        this.item = localStorage.getItem(name);
    }

    private _set: number[] = this.item
        ? JSON.parse(this.item)
        : [];

    private _save() {
        localStorage.setItem(
            this._name,
            JSON.stringify(this._set)
        );
    }

    toArray() {
        return this._set;
    }

    add(value: number) {
        if (!this.contains(value)) {
            this._set.push(value);
            this._save();
        }
    }

    contains(value: number) {
        return this._set.indexOf(value) !== -1;
    }

    remove(value: number) {
        const position = this._set.indexOf(value);
        if (position !== -1) {
            this._set.splice(position, 1);
            this._save();
        }
    }

    size() {
        return this._set.length;
    }

};
