var
  KuzzleRole = require('./kuzzleRole'),
  KuzzleProfile = require('./kuzzleProfile'),
  KuzzleUser = require('./kuzzleUser');

/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @returns {KuzzleSecurity}
 * @constructor
 */
function KuzzleSecurity(kuzzle) {

  Object.defineProperty(this, 'kuzzle', {
    value: kuzzle
  });

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (action) {
      return {
        controller: 'security',
        action: action
      };
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['roleFactory', 'profileFactory', 'userFactory'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}


/**
 * Retrieve a single Role using its unique role ID.
 *
 * @param {string} id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getRole = function (id, cb) {
  var
    data = {_id: id},
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.getRole', cb);

  self.kuzzle.query(this.buildQueryArgs('getRole'), data, null, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null,  new KuzzleRole(self, res.result._id, res.result._source));
  });

  return this;
};

/**
 * Executes a search on roles according to a filter
 *
 * /!\ There is a small delay between role creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a role that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `indexes` with a list of index id, a integer `from` and a integer `size`
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchRoles = function (filters, cb) {
  var
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.searchRoles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchRoles'), {body: filters}, null, function (error, result) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = result.result.hits.map(function (doc) {
      return new KuzzleRole(self, doc._id, doc._source);
    });

    cb(null, { total: result.result.total, documents: documents });
  });

  return this;
};

/**
 * 
 * @param {object} role
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createRole = function (role, cb) {

};

/**
 * Instantiate a new KuzzleRole object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - role id
 * @param {object} content - role content
 * @constructor
 */
KuzzleSecurity.prototype.roleFactory = function(id, content) {
  return new KuzzleRole(this.kuzzle, id, content);
};

/**
 * @param {string} id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getProfile = function (id, cb) {
  var
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.getProfile', cb);

  self.kuzzle.query(this.buildQueryArgs('getProfile'), {_id: id}, null, function (error, response) {
    if (error) {
      return cb(error);
    }

    response.result._source.roles = response.result._source.roles.map(function(role) {
      return new KuzzleRole(self, role._id, role._source);
    });

    cb(null, new KuzzleProfile(self, response.result._id, response.result._source));
  });

  return this;
};

/**
 * Executes a search on profiles according to a filter
 *
 * /!\ There is a small delay between profile creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `roles` with a list of roles id, a integer `from` and a integer `size`
 * @param {Boolean} [hydrate] - if hydrate is true, profiles will have a list of Role object instead of just a list of role id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, hydrate, cb) {
  var
    self = this;

  if (!cb && typeof hydrate === 'function') {
    cb = hydrate;
    hydrate = false;
  }

  filters.hydrate = hydrate;

  self.kuzzle.callbackRequired('KuzzleSecurity.searchProfiles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchProfiles'), {body: filters}, null, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      if (hydrate) {
        doc._source.roles = doc._source.roles.map(function(role) {
          return new KuzzleRole(self, role._id, role._source);
        });
      }

      return new KuzzleProfile(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, documents: documents });
  });

  return this;
};

/**
 *
 * @param {object} profile
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createProfile = function (profile, cb) {

};

/**
 * Instantiate a new KuzzleProfile object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - profile id
 * @param {object} content - profile content
 * @constructor
 */
KuzzleSecurity.prototype.profileFactory = function(id, content) {
  return new KuzzleProfile(this.kuzzle, id, content);
};

/**
 * @param {string} id
 * @param {Boolean} hydrate
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getUser = function (id, hydrate, cb) {

};

/**
 * Executes a search on user according to a filter
 *
 * /!\ There is a small delay between user creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a user that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - same filters as documents filters
 * @param {Boolean} hydrate - if hydrate is true, users will have a Profile object instead of just a profile id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchUsers = function (filters, hydrate, cb) {

};

/**
 *
 * @param {object} profile
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createUser = function (profile, cb) {

};

/**
 * Instantiate a new KuzzleUser object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - user id
 * @param {object} content - user content
 * @constructor
 */
KuzzleSecurity.prototype.userFactory = function(id, content) {
  return new KuzzleUser(this.kuzzle, id, content);
};


module.exports = KuzzleSecurity;