var request = require('supertest');
//var express = require('express');
var assert = require('assert');

var app = require('../app.js').app;
var logic = require('../logic');

var fs = require('fs');
var Papa = require('babyparse'); 

var riskCsv = fs.readFileSync(__dirname + '/fixtures/risks.csv', 'utf8');
var placeCsv = fs.readFileSync(__dirname + '/fixtures/places.csv', 'utf8');
var entryCsv = fs.readFileSync(__dirname + '/fixtures/entries.csv', 'utf8');
// transfoms csv to json
var risks = Papa.parse(riskCsv, {header: true}).data;
var places = Papa.parse(placeCsv, {header: true}).data;
var entries = Papa.parse(entryCsv, {header: true}).data;

describe('Content', function(){
  it('home page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Tracking the state of global cyber health.');
        done();
      });
  });
  
  it('place page', function(done){
    request(app)
      .get('/place')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Place overview');
        done();
      });
  });
  
  it('place/{id} page', function(done){
    request(app)
      .get('/place/united-kingdom')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'united-kingdom');
        checkContent(res, 'Places');
        done();
      });
  });
  
  it('risk page', function(done){
    request(app)
      .get('/risk')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Overview of Risks');
        checkContent(res, 'Spam'); 
        done();
      });
  });
  
  it('risk/{id} page', function(done){
    request(app)
      .get('/risk/openntp/')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Open NTP');
        checkContent(res, 'Devices'); 
        done();
      });
  });
  
  
});

describe('GET /api', function(){
  this.timeout(5000);
  it('responds with correct json', function(done){
    var url = '/api/test.json';
    request(app)
      .get(url)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        checkContent(res, '{"risk":"opendns","place":"ad","year":"2016","count":"30","score":"74.23","rank":"24"}'); 
        done();
      });
  });
});

describe('Logic functions', function(){
  it('Works with getting single entry', function() {
    risk = logic.getSingleEntry(risks, 'id', 'openntp');
    placeById = logic.getSingleEntry(places, 'id', 'gb');
    placeBySlug = logic.getSingleEntry(places, 'slug', 'united-kingdom');
    assert.equal(risk.id, 'openntp');
    assert.equal(placeById.id, 'gb');
    assert.equal(placeById.name, 'United Kingdom');
    assert.equal(placeBySlug.id, 'gb');
  });
});

describe('Database Functions', function(){
  it('Works with single no oprions', function(done) {
    logic.getEntriesFromDatabase().then(function(result){
      assert.equal(result[0].length, 45000);
      done();
    });
  });
  it('Works with single filter', function(done) {
    options = {
      risk: 'spam'
    };
    logic.getEntriesFromDatabase(options).then(function(results){
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
    logic.getEntriesFromDatabase(options).then(function(results){
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
    logic.getEntriesFromDatabase(options).then(function(results){
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
    logic.getEntriesFromDatabase(options).then(function(results){
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

function checkContent(res, expected) {
  var found = res.text.match(expected);
  if (!found) {
    console.log(res.text);
    assert(false, '<<' + expected + '>> not found in page');
  }
}