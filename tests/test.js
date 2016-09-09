var request = require('supertest');
//var express = require('express');
var assert = require('assert');

var app = require('../app.js').app;
var logic = require('../logic');
var database = require('./database.js');

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
  
  it('Works with getting multiple entries', function() {
    entrySingle = logic.getMultipleEntries(entries, place='gb');
    entryMultiple = logic.getMultipleEntries(entries, place='gb', risk='opendns');
    assert.equal(entrySingle.length, 200);
    assert.equal(entrySingle[0].country, 'gb');
    assert.equal(entryMultiple.length, 50);
    assert.equal(entryMultiple[0].risk, 'opendns');
    assert.equal(entryMultiple[0].country, 'gb');
  });
});

function checkContent(res, expected) {
  var found = res.text.match(expected);
  if (!found) {
    console.log(res.text);
    assert(false, '<<' + expected + '>> not found in page');
  }
}