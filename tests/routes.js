var assert = require('assert');
var request = require('supertest');

var app = require('../app.js').app;

describe('Routes', function(){
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
      .get('/country')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'Country overview');
        done();
      });
  });
  
  it('place/{id} page', function(done){
    request(app)
      .get('/country/united-kingdom')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'united-kingdom');
        checkContent(res, 'Countries');
      });
    request(app)
      .get('/country/United-Kingdom')
      .expect(200)
      .end(function(err, res) {
        checkContent(res, 'united-kingdom');
        checkContent(res, 'Countries');
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