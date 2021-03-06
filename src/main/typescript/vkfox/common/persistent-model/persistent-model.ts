"use strict";
import {Model, CombinedModelConstructorOptions} from "backbone";
import {BBCollectionOps} from "../profiles-collection/profiles-collection";


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
    initialize(attributes?: {name: string}, options?: CombinedModelConstructorOptions<{}, this>): void {
        this._name = attributes.name;
        const item = localStorage.getItem(this._name);

        if (item) {
            this.set(JSON.parse(item), BBCollectionOps.beSilentOptions);
        }

        this.on('change', this._save.bind(this));
    }



    _save() {
        localStorage.setItem(this._name, JSON.stringify(this.toJSON()));
    }
}

