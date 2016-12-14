var assert = require('assert');
var request = require('supertest');

var app = require('../app.js').app;

describe('Routes', function(){
  it('home page', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        done();
    });
  });
  
  it('country/ page', function(done){
    request(app)
      .get('/country')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'Country overview');
        done();
    });
  });
  
  it('country/{country_id} page', function(done){
    request(app)
      .get('/country/united-kingdom')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'united-kingdom');
        checkContent(res, 'Countries');
      });
    request(app)
      .get('/country/United-Kingdom')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'united-kingdom');
        checkContent(res, 'Countries');
        done();
    });
  });
  
  it('risk/ page', function(done){
    request(app)
      .get('/risk')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'Overview of Risks');
        checkContent(res, 'Open NTP'); 
        done();
    });
  });
  
  it('risk/risk_id page', function(done){
    request(app)
      .get('/risk/openntp/')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 1);
        checkContent(res, 'Devices'); 
        done();
    });
  });
  
  it('country/{country_id}/{risk_id} page', function(done){
    request(app)
      .get('/country/united-kingdom/openntp/')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'Open NTP');
        checkContent(res, 'United Kingdom'); 
        done();
    });
  });
  
  it('Country ASN page', function(done){
    request(app)
      .get('/country/united-kingdom/asn/44444')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 44444); 
        done();
    });
  });
  
  it('country/{country_id}/asn redirected back to country/{country_id} page', function(done){
    request(app)
      .get('/country/united-kingdom/asn')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 302);
        assert.equal(res.redirect, true);
        assert.equal(res.header.location, '/country/united-kingdom');
        done();
    });
  });
  
  it('Download And API Page', function(done){
    request(app)
      .get('/asn')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        done();
    });
  });
  
  it('Download And API Page', function(done){
    request(app)
      .get('/download')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'Download'); 
        done();
    });
  });
  
  it('About page', function(done){
    request(app)
      .get('/about')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        checkContent(res, 'About'); 
        done();
    });
  });
  
  it('Map page', function(done){
    request(app)
      .get('/vis/map/embed')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        done();
    });
  });
  
  it('Date page', function(done){
    request(app)
      .get('/data/geo.json')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        done();
    });
  });
  
  it('Date page for geo.json', function(done){
    request(app)
      .get('/data/geo.json')
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
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