var logic = require('../logic');
var assert = require('assert');
var request = require('supertest');

var table = 'count';
var app = require('../app.js').app;
var asn;

describe('Get Scores', function(){
  it('Works without parameters', function(done){
    logic.getScores().then(function(results){
      assert(true, results[0].length > 0);
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
  it('Works with single no options', function(done) {
    logic.getEntriesFromDatabase(table).then(function(results){
      assert.equal(results[0].length, 45000);
      done();
    });
  });
  it('Works with single filter', function(done) {
    options = {
      risk: 1
    };
    logic.getEntriesFromDatabase(table, options ).then(function(results){
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
    logic.getEntriesFromDatabase(table, options).then(function(results){
      var rand = results[0][Math.floor(Math.random() * results[0].length)];
      assert.equal(results[0].length, 50);
      assert.equal(rand.risk, 2);
      assert.equal(rand.country, 'GB');
      asn = rand.asn;
      done();
    });
  });
  it('Works with triple filter', function(done) {
    options = {
      risk: 2,
      place: 'gb',
      asn: asn
    };
    logic.getEntriesFromDatabase(table, options).then(function(results){
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
    logic.getEntriesFromDatabase(table, options).then(function(results){
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
      .get('/api/v1/count?start=2016-06-01&end=2016-08-01')
      .expect(200)
      .expect('Content-Type', /json/)	
      .end(function(err, res) {
      	var rand = res.body[Math.floor(Math.random() * res.body.length)];
        assert.equal(res.body.length, 2000);
        assert(true, rand.date < '2016-07-01' && rand.date > '2016-06-01');
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
