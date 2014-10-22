/*global Ember:true*/
'use strict';

var FixtureAdapter = require('./lib/fixture_adapter');
var fmt = Ember.String.fmt;
// var Faker = require('faker');

function stringify(obj) {
  return obj + '';
}

function copy (obj) {
  return Ember.A(obj).copy(true);
}

var fixtures = Ember.Object.create();

function payloadRelationKey (relation) {
  var suffix = '_id';
  return relation.key + ( relation.kind === 'hasMany' ? suffix.pluralize() : suffix );
}

function loadSingleFixture (type, obj) {
  var typeFixtures = Ember.A(fixtures.get(type));

  Ember.assert(fmt("An object with the id %@ already exist for %@", obj.id, type), typeFixtures.filterBy('id', obj.id).length === 0);
  typeFixtures.push(obj);
  fixtures.set(type, typeFixtures);
}

function loadFixture (type, obj) {
  [].concat(obj).forEach(loadSingleFixture.bind(null, type));
}

function updateRelation (payload, type, relation) {
  var payloadKey = payloadRelationKey(relation);
  Ember.assert('In fixtures for %@, the "%@" relation "%@" must be setup with key "%@"'.fmt(type, relation.kind, relation.key, payloadKey), payload.hasOwnProperty(payloadKey));
  var relationRawFixtures = this.getRawFixtures(relation.type);
  var relationJSON;
  var relationIds = [].concat(payload[payloadKey]).map(stringify);
  relationJSON = relationRawFixtures.filter(function (obj) {
    return relationIds.indexOf(stringify(obj.id)) !== -1;
  });
  if (relation.kind === 'belongsTo') {
    relationJSON = relationJSON[0];
  }
  payload[relation.key] = relationJSON;
  delete payload[payloadKey];
}

var FakerAdapter = FixtureAdapter.extend({
  getRawFixtures: function (type) {
    var fixturesForType = fixtures.get(type.typeKey);
    return copy(fixturesForType);
  },
  setRawFixtures: function (type, fixtures) {
    fixtures.set(type.typeKey, copy(fixtures));
    return this.getRawFixtures(type);
  },
  wrapFixture: function (fixture, type) {
    if (Ember.isArray(fixture)) {
      return fixture.map(function (obj) {
        return this.wrapFixture(obj, type);
      }, this);
    }
    var updater = updateRelation.bind(this, fixture, type);
    type.eachRelationship(function (relKey, relationship) {
      updater(relationship);
    });
    return fixture;
  }
});

FakerAdapter.fixtureForType = loadFixture;

module.exports = FakerAdapter;
