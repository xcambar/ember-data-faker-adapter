/*global DS:true, Ember:true*/
'use strict';

var Faker = require('faker');
var fmt = Ember.String.fmt;

var FakerAdapter = DS.FixtureAdapter.extend({
  fixturesForType: function(type) {
    var typeKey = type.typeKey;
    var fixturesForType = FakerAdapter.types[typeKey];
    if (fixturesForType) {
      var fixtures = Ember.A(fixturesForType);
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
});

FakerAdapter.types = {};

module.exports = FakerAdapter;
