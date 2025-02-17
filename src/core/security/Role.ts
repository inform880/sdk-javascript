import { JSONObject, RoleRightsDefinition } from '../../types';

export class Role {
  /**
   * Role unique ID
   */
  _id: string;

  /**
   * List of rights on controllers/actions
   */
  controllers: RoleRightsDefinition;

  private _kuzzle: any;

  /**
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, controllers = {}) {
    Reflect.defineProperty(this, '_kuzzle', {
      value: kuzzle
    });

    this._id = _id;
    this.controllers = controllers;
  }

  protected get kuzzle () {
    return this._kuzzle;
  }

  /**
   * Serialize the instance
   */
  serialize (): JSONObject {
    return {
      _id: this._id,
      controllers: this.controllers,
    };
  }
}

module.exports = { Role };

