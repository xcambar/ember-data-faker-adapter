/*global DS:true, Ember:true*/
'use strict';

var get = Ember.get;
var fmt = Ember.String.fmt;
var indexOf = Ember.EnumerableUtils.indexOf;

var counter = 0;

var Adapter = DS.Adapter;

function generateRemoteCallback (data, type) {
  return function () {
    return this.wrapFixture(data, type);
  };
}

module.exports = Adapter.extend({
  // by default, fixtures are already in normalized form
  serializer: null,

  /**
    If `simulateRemoteResponse` is `true` the `FixtureAdapter` will
    wait a number of milliseconds before resolving promises with the
    fixture values. The wait time can be configured via the `latency`
    property.

    @property simulateRemoteResponse
    @type {Boolean}
    @default true
  */
  simulateRemoteResponse: true,

  /**
    By default the `FixtureAdapter` will simulate a wait of the
    `latency` milliseconds before resolving promises with the fixture
    values. This behavior can be turned off via the
    `simulateRemoteResponse` property.

    @property latency
    @type {Number}
    @default 50
  */
  latency: 50,

  /**
    Implement this method in order to provide data associated with a type

    @method fixturesForType
    @param {Subclass of DS.Model} type
    @return {Array}
  */
  fixturesForType: function(type) {
    var fixtures = this.getRawFixtures(type);
    if (fixtures) {
      return fixtures.map(function(fixture){
        var fixtureIdType = typeof fixture.id;
        if(fixtureIdType !== "number" && fixtureIdType !== "string"){
          throw new Error(fmt('the id property must be defined as a number or string for fixture %@', [fixture]));
        }
        fixture.id = fixture.id + '';
        return fixture;
      });
    }
    return null;
  },

  /**

    @method setFixturesForType
    @param {Subclass of DS.Model} type
    @param {mixed} fixtures
    @return {Array}
  */
  setFixturesForType: function(type, fixtures) {
    return this.setRawFixtures(type, Ember.A(fixtures));
  },

  /**
    Override ths method to change how the fixtures are accessed in your app

    @method fetchFixtures
    @param {Subclass of DS.Model} type
    @return {Array}
  */
  getRawFixtures: function (type) {
    return type.FIXTURES || null;
  },

  /**
    Override ths method to change how the fixtures are defined in your app

    @method setRawFixtures
    @param {Subclass of DS.Model} type
    @param {mixed} fixtures
    @return {Array}
  */
  setRawFixtures: function (type, fixtures) {
    type.FIXTURES = Ember.A(fixtures);
    return type.FIXTURES;
  },

  /**
    Implement this method in order to query fixtures data

    @method queryFixtures
    @param {Array} fixture
    @param {Object} query
    @param {Subclass of DS.Model} type
    @return {Promise|Array}
  */
  queryFixtures: function(/*fixtures, query, type*/) {
    Ember.assert('Not implemented: You must override the DS.FixtureAdapter::queryFixtures method to support querying the fixture store.');
  },

  /**
    @method updateFixtures
    @param {Subclass of DS.Model} type
    @param {Array} fixture
  */
  updateFixtures: function(type, fixture) {
    var fixtures = Ember.A(this.fixturesForType(type));
    if(Ember.isArray(fixtures)) {
      this.deleteLoadedFixture(type, fixture);
    }
    fixtures = Ember.A(fixtures);
    fixtures.push(fixture);
    this.setFixturesForType(type, fixtures);
  },

  /**
    Implement this method in order to provide json for CRUD methods

    @method mockJSON
    @param {Subclass of DS.Model} type
    @param {DS.Model} record
  */
  mockJSON: function(store, type, record) {
    return store.serializerFor(type).serialize(record, { includeId: true });
  },

  /**
    @method generateIdForRecord
    @param {DS.Store} store
    @param {DS.Model} record
    @return {String} id
  */
  generateIdForRecord: function(/*store*/) {
    return "fixture-" + counter++;
  },

  /**
    @method find
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} id
    @return {Promise} promise
  */
  find: function(store, type, id) {
    console.log(type, id)
    var fixtures = this.fixturesForType(type);
    var fixture;

    Ember.assert("Unable to find fixtures for model type "+type.toString() +". If you're defining your fixtures using `Model.FIXTURES = ...`, please change it to `Model.reopenClass({ FIXTURES: ... })`.", fixtures);

    if (fixtures) {
      fixture = Ember.A(fixtures).findBy('id', id);
    }

    if (fixture) {
      return this.simulateRemoteCall(generateRemoteCallback(fixture, type), this);
    }
  },

  /**

    Override this method so the payload looks fine to your serializers
    @method wrapFixture
    @param {Object} fixture
    @param {subclass of DS.Model} type
    @return {Object}
  */
  wrapFixture: function (fixture/*, type*/) {
    return fixture;
  },

  /**
    @method findMany
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Array} ids
    @return {Promise} promise
  */
  findMany: function(store, type, ids) {
    console.log(type, ids)
    var fixtures = this.fixturesForType(type);

    Ember.assert("Unable to find fixtures for model type "+type.toString(), fixtures);

    if (fixtures) {
      fixtures = fixtures.filter(function(item) {
        return indexOf(ids, item.id) !== -1;
      });
    }

    if (fixtures) {
      return this.simulateRemoteCall(generateRemoteCallback(fixtures, type), this);
    }
  },

  /**
    @private
    @method findAll
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} sinceToken
    @return {Promise} promise
  */
  findAll: function(store, type) {
    console.log('all', type)
    var fixtures = this.fixturesForType(type);

    Ember.assert("Unable to find fixtures for model type "+type.toString(), fixtures);

    return this.simulateRemoteCall(generateRemoteCallback(fixtures, type), this);
  },

  /**
    @private
    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} query
    @param {DS.AdapterPopulatedRecordArray} recordArray
    @return {Promise} promise
  */
  findQuery: function(store, type, query/*, array*/) {
    var fixtures = this.fixturesForType(type);

    Ember.assert("Unable to find fixtures for model type " + type.toString(), fixtures);

    fixtures = this.queryFixtures(fixtures, query, type);

    if (fixtures) {
      return this.simulateRemoteCall(generateRemoteCallback(fixtures, type), this);
    }
  },

  /**
    @method createRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @return {Promise} promise
  */
  createRecord: function(store, type, record) {
    var fixture = this.mockJSON(store, type, record);

    this.updateFixtures(type, fixture);

    return this.simulateRemoteCall(generateRemoteCallback(fixture, type), this);
  },

  /**
    @method updateRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @return {Promise} promise
  */
  updateRecord: function(store, type, record) {
    var fixture = this.mockJSON(store, type, record);

    this.updateFixtures(type, fixture);

    return this.simulateRemoteCall(generateRemoteCallback(fixture, type), this);
  },

  /**
    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @return {Promise} promise
  */
  deleteRecord: function(store, type, record) {
    this.deleteLoadedFixture(type, record);

    return this.simulateRemoteCall(generateRemoteCallback(null, type), this);
  },

  /*
    @method deleteLoadedFixture
    @private
    @param type
    @param record
  */
  deleteLoadedFixture: function(type, record) {
    var existingFixture = this.findExistingFixture(type, record);
    var fixtures = Ember.A(this.fixturesForType(type));

    if (existingFixture) {
      var index = indexOf(fixtures, existingFixture);
      fixtures.splice(index, 1);
      this.setFixturesForType(type, fixtures);
      return true;
    }
  },

  /*
    @method findExistingFixture
    @private
    @param type
    @param record
  */
  findExistingFixture: function(type, record) {
    var fixtures = this.fixturesForType(type);
    var id = get(record, 'id');

    return this.findFixtureById(fixtures, id);
  },

  /*
    @method findFixtureById
    @private
    @param fixtures
    @param id
  */
  findFixtureById: function(fixtures, id) {
    return Ember.A(fixtures).find(function(r) {
      if (''+get(r, 'id') === ''+id) {
        return true;
      } else {
        return false;
      }
    });
  },

  /*
    @method simulateRemoteCall
    @private
    @param callback
    @param context
  */
  simulateRemoteCall: function(callback, context) {
    var adapter = this;

    return new Ember.RSVP.Promise(function(resolve) {
      var value = Ember.copy(callback.call(context), true);
      if (get(adapter, 'simulateRemoteResponse')) {
        // Schedule with setTimeout
        Ember.run.later(function() {
          resolve(value);
        }, get(adapter, 'latency'));
      } else {
        // Asynchronous, but at the of the runloop with zero latency
        Ember.run.schedule('actions', null, function() {
          resolve(value);
        });
      }
    }, "DS: FixtureAdapter#simulateRemoteCall");
  }
});
