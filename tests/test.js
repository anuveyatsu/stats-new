var request = require('supertest');
//var express = require('express');
var assert = require('assert');

var app = require('../app.js').app;

describe('Content', function(){
  it('home page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Home');
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
      .get('/place/test-place')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'test-place');
        checkContent(res, 'Places');
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