var Sequelize = require('sequelize');
var dbConfig = require('../config').db;
var logic = require('../logic');
var assert = require('assert');
var table = 'entries'

sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig);
var asn;

describe('Database connection', function() {
  it('successfully connected', function(done) {   
    sequelize
      .authenticate()
      .then(function(err) { 
      	if (err) console.log('Unable to connect to the database:', err);
        done();
    });
  }); 
});

describe('Database Functions', function(){
  it('Works with single no options', function(done) {
    logic.getEntriesFromDatabase(sequelize, table).then(function(results){
      assert.equal(results[0].length, 56250);
      done();
    });
  });
  it('Works with single filter', function(done) {
    options = {
      risk: 1
    };
    logic.getEntriesFromDatabase(sequelize, table, options ).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 11250);
      assert.equal(rand.risk, 1);
      done();
    });
  });
  it('Works with double filter', function(done) {
    options = {
      risk: 2,
      place: 'gb'
    };
    logic.getEntriesFromDatabase(sequelize, table, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 50);
      assert.equal(rand.risk, 2);
      assert.equal(rand.country, 'GB');
      asn = rand.asn
      done();
    });
  });
  it('Works with triple filter', function(done) {
    console.log(asn)
    options = {
      risk: 2,
      place: 'gb',
      asn: asn
    };
    logic.getEntriesFromDatabase(sequelize, table, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 5);
      assert.equal(rand.risk, 2);
      assert.equal(rand.country, 'GB');
      assert.equal(rand.asn, asn);
      done();
    });
  });
  it('Works with all filters', function(done) {
    options = {
      risk: 4,
      place: 'gb',
      asn: asn,
      date: '2016-05-01'
    };
    logic.getEntriesFromDatabase(sequelize, table, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      //var time = new Date('2016-05-01');
      assert.equal(results[0].length, 1);
      assert.equal(rand.risk, 4);
      assert.equal(rand.country, 'GB');
      assert.equal(rand.asn, asn);
      // todo: fix timezone problem
      //assert.equal(rand.month, time);
      done();
    });
  });
});
