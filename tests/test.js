var request = require('supertest');
//var express = require('express');
var assert = require('assert');

var app = require('../app.js').app;
var logic = require('../logic');

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
        checkContent(res, 'Open NTP'); 
        done();
      });
  });
  
  it('risk/{id} page', function(done){
    request(app)
      .get('/risk/openntp/')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 1);
        checkContent(res, 'Devices'); 
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
