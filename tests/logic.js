var logic = require('../logic');
var assert = require('assert');
var request = require('supertest');

var app = require('../app.js').app;

describe('Get Scores', function(){
  it('Works without country and risk parameters', function(done){
    logic.getScores({date: '2016-07-01'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-07-01'));
      done();
    });
  });
  it('Works with country parameter', function(done){
    logic.getScores({date: '2016-07-01', country:'united-kingdom'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-07-01'));
      done();
    });
  });
  it('Works with risk parameter', function(done){
    logic.getScores({date: '2016-07-01', risk:'openntp'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].risk, 'openntp');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-07-01'));
      done();
    });
  });
  it('Works with country and risk parameters together', function(done){
    logic.getScores({date: '2016-07-01', country:'united-kingdom', risk: 'openntp'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      assert.equal(results[0][0].risk, 'openntp');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-07-01'));
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
    logic.getAsnCount('GB', '2016-07-01').then(function(results){
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
        assert.equal(res.body.results.length, 20);
        assert.equal(res.body.results[0].country, "ad");
        assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
        assert.equal(res.body.status, 'ok');
        assert.equal(res.body.number_of_data_results, 4500);
        assert.equal(res.body.page, "/api/v1/count_by_country?page=1&limit=20&");
        assert.equal(res.body.next_page, "/api/v1/count_by_country?page=2&limit=20&");
        assert.equal(res.body.total_pages, 225);
        assert.equal(res.body.status_code, 200);
      });
    request(app)
      .get('/api/v1/count_by_country?country=gb&risk=openntp&limit=4')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 4);
        assert.equal(res.body.results[0].country, 'gb');
        assert.equal(res.body.results[0].risk, 'openntp');
        assert.equal(res.body.results[0].date, '2016-08-15');
      });
    request(app)
      .get('/api/v1/count_by_country?start=2016-06-01&end=2016-08-15')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
      });
    request(app)
      .get('/api/v1/count_by_country?start=2016-06-01&end=2016-08-15&page=135')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-06-01"));
      });
    request(app)
      .get('/api/v1/count_by_country?start=2016-06-01&end=2016-08-15&page=70')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-07-01"));
      });
    request(app)
      .get('/api/v1/count_by_country?country=test OR 1=1')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 0);
      });
    request(app)
      .get('/api/v1/count_by_country?limit=none')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 4500);
        done();
      });  
  });
  it('Countries API', function(done){
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
        assert.equal(res.body[0].id, 'openrecursivedns');
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
    // checks defaults
    request(app)
      .get('/api/v1/count')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 20);
        // cheks sorting country ASC
        assert.equal(res.body.results[0].country, "AD");
        // cheks sortin date DESC
        assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
        assert.equal(res.body.status, 'ok');
        assert.equal(res.body.number_of_data_results, 45000);
        assert.equal(res.body.page, "/api/v1/count?page=1&limit=20&");
        assert.equal(res.body.next_page, "/api/v1/count?page=2&limit=20&");
        assert.equal(res.body.total_pages, 2250);
        assert.equal(res.body.status_code, 200);
      });
    // ckecks dinamyc limit and pagination
    request(app)
      .get('/api/v1/count?limit=30')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 30);
        assert.equal(res.body.total_pages, 1500);
      });
    // cheks maks limit and pagination
    request(app)
      .get('/api/v1/count?limit=3000')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 500);
        assert.equal(res.body.total_pages, 90);
      });
    // cheks error hendling
    request(app)
      .get('/api/v1/count?limit=invalidIntiger')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.error, 'invalid input syntax for integer: "invalidIntiger"');
      });
    // cheks risk id  
    request(app)
      .get('/api/v1/count?risk=1')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 20);
        assert.equal(res.body.results[0].risk, "1");
      });
    // cheks country id
    request(app)
      .get('/api/v1/count?country=gb')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 20);
        assert.equal(res.body.results[0].country, "GB");
      });
    // cheks country id Caseinsensitive
    request(app)
      .get('/api/v1/count?country=Gb')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 20);
        assert.equal(res.body.results[0].country, "GB");
      });
    // checks ivalid country id
    request(app)
      .get('/api/v1/count?country=unknown')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
        assert.equal(res.body.results.length, 0);
      });
    request(app)
      .get('/api/v1/count?start=2016-06-01&end=2016-08-15')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
      });
    request(app)
      .get('/api/v1/count?start=2016-06-01&end=2016-08-15&page=1350')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-06-01"));
      });
    request(app)
      .get('/api/v1/count?start=2016-06-01&end=2016-08-15&page=700')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-07-01"));
        done();
      });
  });
});
