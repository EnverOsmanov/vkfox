"use strict";
import {Model} from "backbone";
import storage from "../storage/storage";
import {Profiles} from "../feedbacks/collections/ProfilesColl";

export default class PersistentModel extends Model {
    _name: string;

    /**
    * Stores and restores model from localStorage.
    * Requires 'name' in options, for localStorage key name
    *
    * @param {Object} attributes
    * @param {Object} options
    * @param {String} options.name
    */
    initialize(attributes, options) {
        this._name = options.name;
        const item = storage.getItem(this._name);

        if (item) {
            this.set(JSON.parse(item), Profiles.beSilentOptions);
        }

        this.on('change', this._save.bind(this));
    }

    _save() {
        storage.setItem(this._name, JSON.stringify(this.toJSON()));
    }
}

