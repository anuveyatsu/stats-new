var logic = require('../logic');
var assert = require('assert');
var request = require('supertest');

var app = require('../app.js').app;

describe('Get Scores', function(){
  it('Works without parameters', function(done){
    logic.getScores().then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].date, '2016-07-01');
      done();
    });
  });
  it('Works with country parameter', function(done){
    logic.getScores({country:'united-kingdom'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      done();
    });
  });
  it('Works with risk parameter', function(done){
    logic.getScores({risk:'openntp'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].risk, 'openntp');
      done();
    });
  });
  it('Works with country and risk parameters together', function(done){
    logic.getScores({country:'united-kingdom', risk: 'openntp'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      assert.equal(results[0][0].risk, 'openntp');
      done();
    });
  });
  it('Fails with wrong parameters', function(done){
    logic.getScores({country:'country', risk: 'openntp'}).then(function(results){
      assert.equal(results[0].length, 0);
    });
    logic.getScores({country:'united-kingdom', risk: 'unknown'}).then(function(results){
      assert.equal(results[0].length, 0);
      done();
    });
  });
  it('Handles with SQL injections', function(done){
    logic.getScores({country:'united-kingdom or 1=1'}).then(function(results){
      assert.equal(results[0].length, 0);
    });
    logic.getScores({country:" OR country %3D 'LV'%3B --"}).then(function(results){
      assert.equal(results[0].length, 0);
      done();
    });
  });
});

describe('Database Functions', function(){
  it('Works with ASN count', function(done) {
    logic.getAsnCount('GB').then(function(results){
      assert.equal(results[0].length, 40);
      done();
    });
  });
});

describe('API', function(){
  it('Count by country API', function(done){
    request(app)
      .get('/api/v1/count_by_country')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 2000);
        assert.equal(res.body[0].risk, 'opendns');
        assert.equal(res.body[0].date, '2016-08-15');
      });
    request(app)
      .get('/api/v1/count_by_country?country=gb&risk=openntp&limit=4')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 4);
        assert.equal(res.body[0].country, 'gb');
        assert.equal(res.body[0].risk, 'openntp');
        assert.equal(res.body[0].date, '2016-08-15');
      });
    request(app)
      .get('/api/v1/count_by_country?date=2016-07-01&risk=openntp&limit=30')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 30);
        assert.equal(res.body[0].risk, 'openntp');
        assert.equal(res.body[0].date, '2016-07-01');
      });
    request(app)
      .get('/api/v1/count_by_country?country=test OR 1=1')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 0);
        done();
      });
  });
  it('Places API', function(done){
    request(app)
      .get('/api/v1/country')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 225);
        assert.equal(res.body[0].id, 'ad');
        assert.equal(res.body[0].name, 'Andorra');
      });
    request(app)
      .get('/api/v1/country?id=ad&name=Andorra&region=europe&continent=europe')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].id, 'ad');
        assert.equal(res.body[0].name, 'Andorra');
        assert.equal(res.body[0].slug, 'andorra');
        assert.equal(res.body[0].region, 'Europe');
        assert.equal(res.body[0].continent, 'Europe');
        done();
      });
  });
  it('Risks API', function(done){
    request(app)
      .get('/api/v1/risk')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 4);
        assert.equal(res.body[0].id, 'opendns');
        assert.equal(res.body[1].id, 'openntp');
      });
    request(app)
      .get('/api/v1/risk?title=Open NTP&risk_id=2&id=openntp')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].id, 'openntp');
        done();
      });
  });
  it('ASNs API', function(done){
    request(app)
      .get('/api/v1/asn')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 2250);
        assert.equal(res.body[0].country, 'ad');
        assert.equal(res.body[0].date, '2016-01-01');
        done();
      });  	
  });
  it('count API', function(done){
    request(app)
      .get('/api/v1/count')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 2000);
        done();
      });  	
  });
  it('count API (period)', function(done){
    request(app)
      .get('/api/v1/count?limit=18000&start=2016-06-01&end=2016-08-01')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	var rand = res.body[Math.floor(Math.random() * res.body.length)];
        assert.equal(res.body.length, 18000);
        assert(true, new Date(rand.date) < new Date('2016-08-01') && new Date(rand.date) > new Date('2016-06-01'));
        done();
      });  	
  });
  it('Works with API queries', function(done){
    request(app)
      .get('/api/v1/count_by_country?risk=openntp&country=gb&date=2016-07-01')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].risk, 'openntp');
        assert.equal(res.body[0].country, 'gb');
        assert.equal(res.body[0].date, '2016-07-01');  
        done();
      });  	
  });  
});
