var Sequelize = require('sequelize');
var dbConfig = require('../dbconfig');
var logic = require('../logic');
var assert = require('assert');


sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig);

describe('Database connection', function() {
  it('successfully connected', function(done) {   
    sequelize
      .authenticate()
      .then(function(err) { 
        console.log('Unable to connect to the database:', err);
        done();
    });
  }); 
});

describe('Database Functions', function(){
  it('Works with single no options', function(done) {
    logic.getEntriesFromDatabase(sequelize).then(function(results){
      assert.equal(results[0].length, 45000);
      done();
    });
  });
  it('Works with single filter', function(done) {
    options = {
      risk: 'spam'
    };
    logic.getEntriesFromDatabase(sequelize, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 11250);
      assert.equal(rand.risk, 'spam');
      done();
    });
  });
  it('Works with double filter', function(done) {
    options = {
      risk: 'openntp',
      place: 'gb'
    };
    logic.getEntriesFromDatabase(sequelize, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 50);
      assert.equal(rand.risk, 'openntp');
      assert.equal(rand.country, 'gb');
      done();
    });
  });
  it('Works with triple filter', function(done) {
    options = {
      risk: 'openntp',
      place: 'gb',
      asn: 4547028
    };
    logic.getEntriesFromDatabase(sequelize, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 5);
      assert.equal(rand.risk, 'openntp');
      assert.equal(rand.country, 'gb');
      assert.equal(rand.asn, 4547028);
      done();
    });
  });
  it('Works with all filters', function(done) {
    options = {
      risk: 'openntp',
      place: 'gb',
      asn: 4547028,
      date: '2016-05-01'
    };
    logic.getEntriesFromDatabase(sequelize, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      //var time = new Date('2016-05-01');
      assert.equal(results[0].length, 1);
      assert.equal(rand.risk, 'openntp');
      assert.equal(rand.country, 'gb');
      assert.equal(rand.asn, 4547028);
      // todo: fix timezone problem
      //assert.equal(rand.month, time);
      done();
    });
  });
});