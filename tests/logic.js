var logic = require('../logic');
var assert = require('assert');
var request = require('supertest');

var app = require('../app.js').app;

describe('Get Counts and needed info For Each country', function() {
  var entries = [
      {
        date: '1970-01-01', risk: 1, risk_slug: 'test', risk_title: 'test',
        risk_description: 'test', country_id: 'ZZ', name: 'Test Z',
        slug: 'test-z', count: '10', count_amplified: 100
      },
      {
        date: '1970-01-01', risk: 2, risk_slug: 'test', risk_title: 'test',
        risk_description: 'test', country_id: 'ZZ', name: 'Test Z',
        slug: 'test-z', count: '20', count_amplified: 150
      },
      {
        date: '1970-01-01', risk: 1, risk_slug: 'test', risk_title: 'test',
        risk_description: 'test', country_id: 'AA', name: 'Test A',
        slug: 'test-a', count: '20', count_amplified: 150
      }
    ];
  it('Has all necessary keys', function(done) {
    var result = logic.getCountsForCountry(entries);
    var exp = [0, 1, 2, 'slug', 'name'];
    var notExp = [0, 1, 2, 'slug', 'not-name'];
    assert.deepEqual(Object.keys(result[0]), exp);
    assert.notDeepEqual(Object.keys(result[0]), notExp);
    done();
  });
  it('Has all countries', function(done) {
    var result = logic.getCountsForCountry(entries);
    assert.equal(result[0].slug, 'test-z');
    assert.equal(result[1].slug, 'test-a');
    done();
  });
  it('Risks have apropriate counts', function(done) {
    var result = logic.getCountsForCountry(entries);
    assert.equal(result[0][1].count, 10);
    assert.equal(result[0][1].af_count, 100);
    assert.equal(result[0][2].count, 20);
    assert.equal(result[0][2].af_count, 150);
    assert.equal(result[1][1].count, 20);
    assert.equal(result[1][1].af_count, 150);
    assert.equal(result[1][2], undefined);
    done();
  });
  it('Total counts are summed correctly', function(done) {
    var result = logic.getCountsForCountry(entries);
    assert.equal(result[0][0].count, 30);
    assert.equal(result[0][0].af_count, 250);
    assert.equal(result[1][0].count, 20);
    assert.equal(result[1][0].af_count, 150);
    done();
  });
});

describe('Get Aggregated entries', function(){
  it('Works without any parameters', function(done){
    logic.getAggregatedEntries().then(function(results){
      assert(true, results[0].length > 0);
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-08-01'));
      done();
    });
  });
  it('Returns all necessary columns', function(done){
    logic.getAggregatedEntries().then(function(results){
      assert.equal(true, results[0][0].hasOwnProperty('date'));
      assert.equal(true, results[0][0].hasOwnProperty('risk'));
      assert.equal(true, results[0][0].hasOwnProperty('risk_slug'));
      assert.equal(true, results[0][0].hasOwnProperty('risk_title'));
      assert.equal(true, results[0][0].hasOwnProperty('risk_description'));
      assert.equal(true, results[0][0].hasOwnProperty('country_id'));
      assert.equal(true, results[0][0].hasOwnProperty('name'));
      assert.equal(true, results[0][0].hasOwnProperty('slug'));
      assert.equal(true, results[0][0].hasOwnProperty('count'));
      assert.equal(true, results[0][0].hasOwnProperty('count_amplified'));
      done();
    });
  });
  it('Works with date parameter only', function(done){
    logic.getAggregatedEntries({date: '2016-08-01'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-08-01'));
      done();
    });
  });
  it('Works with date and country parameters', function(done){
    logic.getAggregatedEntries({date: '2016-08-01', country:'united-kingdom'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-08-01'));
      done();
    });
  });
  it('Works with date and risk parameters', function(done){
    logic.getAggregatedEntries({date: '2016-08-01', risk:'openntp'}).then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].risk, 2);
      assert.equal(results[0][0].risk_slug, 'openntp');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-08-01'));
      done();
    });
  });
  it('Works with all 3 parameters', function(done){
    logic.getAggregatedEntries({date: '2016-08-01', country:'united-kingdom', risk: 'openntp'})
      .then(function(results){
      assert(true, results[0].length > 0);
      assert.equal(results[0][0].country_id, 'GB');
      assert.equal(results[0][0].risk_slug, 'openntp');
      assert.deepEqual(new Date(results[0][0].date), new Date('2016-08-01'));
      done();
    });
  });
  it('Returns no entries if given risk or country does not exsit', function(done){
    logic.getAggregatedEntries({country:'country', risk: 'openntp'}).then(function(results){
      assert.equal(results[0].length, 0);
    });
    logic.getAggregatedEntries({country:'united-kingdom', risk: 'unknown'}).then(function(results){
      assert.equal(results[0].length, 0);
      done();
    });
  });
  it('Handles with SQL injections', function(done){
    logic.getAggregatedEntries({country:'united-kingdom or 1=1'}).then(function(results){
      assert.equal(results[0].length, 0);
    });
    logic.getAggregatedEntries({country:" OR country %3D 'LV'%3B --"}).then(function(results){
      assert.equal(results[0].length, 0);
      done();
    });
  });
});

describe('Database Functions return non empty list and all necessary columns from db', function(){
  it('getAsnCount works fine', function(done) {
    logic.getAsnCount('GB', '2016-08-01').then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('asn'));
      assert.equal(true, results[0][0].hasOwnProperty('risk'));
      assert.equal(true, results[0][0].hasOwnProperty('count'));
      assert.equal(true, results[0][0].hasOwnProperty('count_amplified'));
      done();
    });
  });
  it('getRisks works fine', function(done) {
    logic.getRisks().then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('id'));
      assert.equal(true, results[0][0].hasOwnProperty('slug'));
      assert.equal(true, results[0][0].hasOwnProperty('title'));
      assert.equal(true, results[0][0].hasOwnProperty('amplification_factor'));
      assert.equal(true, results[0][0].hasOwnProperty('description'));
      done();
    });
  });
  it('getCountries works fine', function(done) {
    logic.getCountries().then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('id'));
      assert.equal(true, results[0][0].hasOwnProperty('slug'));
      assert.equal(true, results[0][0].hasOwnProperty('name'));
      assert.equal(true, results[0][0].hasOwnProperty('region'));
      assert.equal(true, results[0][0].hasOwnProperty('continent'));
      done();
    });
  });
  it('getEntriesByASN works fine', function(done) {
    logic.getEntriesByASN(44444).then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(results[0][0].asn, 44444);
      assert.equal(true, results[0][0].hasOwnProperty('risk'));
      assert.equal(true, results[0][0].hasOwnProperty('country'));
      assert.equal(true, results[0][0].hasOwnProperty('asn'));
      assert.equal(true, results[0][0].hasOwnProperty('date'));
      assert.equal(true, results[0][0].hasOwnProperty('count'));
      done();
    });
  });
  // gets sum of infected devises for all risks on given date
  it('getRiskCount works fine', function(done) {
    logic.getRiskCount({date: '2016-08-01'}).then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('slug'));
      assert.equal(true, results[0][0].hasOwnProperty('title'));
      assert.equal(true, results[0][0].hasOwnProperty('description'));
      assert.equal(true, results[0][0].hasOwnProperty('date'));
      assert.equal(true, results[0][0].hasOwnProperty('count'));
      done();
    });
  });
  it('getAsnTotal works fine', function(done) {
    logic.getAsnTotal().then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('slug'));
      assert.equal(true, results[0][0].hasOwnProperty('name'));
      assert.equal(true, results[0][0].hasOwnProperty('country'));
      assert.equal(true, results[0][0].hasOwnProperty('count'));
      done();
    });
  });
  it('getDates works fine', function(done) {
    logic.getDates().then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(true, results[0][0].hasOwnProperty('date'));
      done();
    });
  });
  it('CHeck count number of results for cube ', function(done) {
    var queryOptions = {
      country: "", risk: -1,
      start: "", end: "",
      limit: "20",
      page: 1,
      granularity: 'week'
    };
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0].length > 0, true);
      assert.equal(results[0][0].hasOwnProperty('count'), true);
      assert.equal(results[0][0].count, 5165);
    });
    // check risk
    queryOptions.risk = 1;
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 959);
    });
    // Check total
    queryOptions.risk = 100;
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 1200);
    });
    // Check country
    queryOptions.risk = -1;
    queryOptions.country = 'T';
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 22);
    });
    queryOptions.country = 'GB';
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 22);
    });
    // check total ddos
    queryOptions.risk = 100;
    queryOptions.country = 'T';
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 5);
    });
    // switch granularity
    queryOptions.ganularity = 'month';
    logic.getRowCountBYCountry(queryOptions).then(function(results){
      assert.equal(results[0][0].count, 5);
      done();
    });
  });
});

// API
describe('API - Count By Country', function() {
  it('Endpoint returns correct metadata', function(done) {
    request(app)
      .get('/api/v1/count_by_country')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.hasOwnProperty('total'). true);
        assert.equal(res.body.hasOwnProperty('results'). true);
        assert.equal(res.body.results[0].hasOwnProperty('risk'), true);
        assert.equal(res.body.results[0].hasOwnProperty('country'), true);
        assert.equal(res.body.results[0].hasOwnProperty('date'), true);
        assert.equal(res.body.results[0].hasOwnProperty('count'), true);
        assert.equal(res.body.results[0].hasOwnProperty('count_amplified'), true);
        done();
    });
  });
  it('Results return correct defaults', function(done) {
    request(app)
      .get('/api/v1/count_by_country')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 20);
        done();
    });
  });
  it('Works with limitation', function(done) {
    request(app)
      .get('/api/v1/count_by_country?limit=1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 1);
    });
    request(app)
      .get('/api/v1/count_by_country?limit=453')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 453);
    });
    request(app)
      .get('/api/v1/count_by_country?limit=1000')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 500);
        done();
    });
  });
  it('Works with time granularities', function(done) {
    request(app)
      .get('/api/v1/count_by_country?granularity=week')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-08-29'));
    });
    request(app)
      .get('/api/v1/count_by_country?granularity=month')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-08-01'));
    });
    request(app)
      .get('/api/v1/count_by_country?granularity=quarter')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-07-01'));
    });
    request(app)
      .get('/api/v1/count_by_country?granularity=year')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-01-01'));
        done();
    });
  });
  it('Handles with invalid time granularity', function(done) {
    request(app)
      .get('/api/v1/count_by_country?granularity=wrong')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.error, 'Invalid Time Granunlarity');
        done();
    });
  });
  it('Works drill down by risk id', function(done) {
    request(app)
      .get('/api/v1/count_by_country?risk=1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results[0].risk, 1);
        done();
    });
  });
  it('Works with global ddos', function(done) {
    request(app)
      .get('/api/v1/count_by_country?risk=100')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results[0].risk, 100);
        done();
    });
  });
  it('Returns empty list for unknown entry', function(done) {
    request(app)
      .get('/api/v1/count_by_country?risk=10')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(res.body.results, []);
        done();
    });
  });
  it('Works drill down by country id (case insensitive)', function(done) {
    request(app)
      .get('/api/v1/count_by_country?country=gb')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results[0].country, 'GB');
        assert.equal(res.body.results[0].country, 'GB');
        done();
    });
  });
  it('Works with global country', function(done) {
    request(app)
      .get('/api/v1/count_by_country?country=T')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results[0].country, 'T');
        done();
    });
  });
  it('Returns empty list for unknown country', function(done) {
    request(app)
      .get('/api/v1/count_by_country?country=unknown')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(res.body.results, []);
        done();
    });
  });
  it('Works start date (inclusive)', function(done) {
    request(app)
      .get('/api/v1/count_by_country?start=2016-08-22&limit=500')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results.pop().date), new Date('2016-08-22'));
        done();
    });
  });
  it('Works end date (inclusive)', function(done) {
    request(app)
      .get('/api/v1/count_by_country?end=2016-08-22&limit=500')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-08-22'));
        done();
    });
  });
  it('Works start and end dates together', function(done) {
    request(app)
      .get('/api/v1/count_by_country?start=2016-08-22&end=2016-08-22&limit=500')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-08-22'));
        assert.deepEqual(new Date(res.body.results.pop().date), new Date('2016-08-22'));
        done();
    });
  });
  it('Handles with SQL injections', function(done){
    request(app)
      .get('/api/v1/count_by_country?country=gb or 1=1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(res.body.results, []);
    });
    request(app)
      .get("/api/v1/count_by_country?country=gb or OR country %3D 'LV'%3B --")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.deepEqual(res.body.results, []);
        done();
    });
  });
  it('Works with multiple options', function(done) {
    request(app)
      .get('/api/v1/count_by_country?risk=2&country=gb&start=2016-08-08&end=2016-08-22&granularity=week&limit=2&page=2')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 1);
        assert.equal(res.body.results[0].risk, 2);
        assert.equal(res.body.results[0].country, 'GB');
        assert.deepEqual(new Date(res.body.results[0].date), new Date('2016-08-08'));
        done();
    });
  });
});

describe('API', function(){
  it('Countries API', function(done){
    request(app)
      .get('/api/v1/country')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 246);
        assert.equal(res.body.results[0].id, 'AD');
        assert.equal(res.body.results[0].name, 'Andorra');
      });
    request(app)
      .get('/api/v1/country?id=ad&name=Andorra&region=europe&continent=europe')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 1);
        assert.equal(res.body.results[0].id, 'AD');
        assert.equal(res.body.results[0].name, 'Andorra');
        assert.equal(res.body.results[0].slug, 'andorra');
        assert.equal(res.body.results[0].region, 'Europe');
        assert.equal(res.body.results[0].continent, 'Europe');
        done();
      });
  });
  it('Risks API', function(done){
    request(app)
      .get('/api/v1/risk')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 5);
        assert.equal(res.body.results[0].slug, 'open-recursive-dns');
        assert.equal(res.body.results[1].slug, 'openntp');
      });
    request(app)
      .get('/api/v1/risk?title=Open NTP&id=2&slug=openntp')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        assert.equal(res.body.results.length, 1);
        assert.equal(res.body.results[0].slug, 'openntp');
        done();
      });
  });
  //it('ASNs API', function(done){
  //  request(app)
  //    .get('/api/v1/asn')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.length, 79679);
  //      assert.equal(res.body[0].country, 'AD');
  //      assert.equal(res.body[0].name, '2016-08-01');
  //      done();
  //    });
  //});
  //it('count API', function(done){
  //  // checks defaults
  //  request(app)
  //    .get('/api/v1/count')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 20);
  //      // cheks sorting country ASC
  //      assert.equal(res.body.results[0].country, "AD");
  //      // cheks sortin date DESC
  //      assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
  //      assert.equal(res.body.status, 'ok');
  //      assert.equal(res.body.number_of_data_results, 45000);
  //      assert.equal(res.body.page, "/api/v1/count?page=1&limit=20&");
  //      assert.equal(res.body.next_page, "/api/v1/count?page=2&limit=20&");
  //      assert.equal(res.body.total_pages, 2250);
  //      assert.equal(res.body.status_code, 200);
  //    });
  //  // ckecks dinamyc limit and pagination
  //  request(app)
  //    .get('/api/v1/count?limit=30')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 30);
  //      assert.equal(res.body.total_pages, 1500);
  //    });
  //  // cheks maks limit and pagination
  //  request(app)
  //    .get('/api/v1/count?limit=3000')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 500);
  //      assert.equal(res.body.total_pages, 90);
  //    });
  //  // cheks error hendling
  //  request(app)
  //    .get('/api/v1/count?limit=invalidIntiger')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.error, 'invalid input syntax for integer: "invalidIntiger"');
  //    });
  //  // cheks risk id
  //  request(app)
  //    .get('/api/v1/count?risk=1')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 20);
  //      assert.equal(res.body.results[0].risk, "1");
  //    });
  //  // cheks country id
  //  request(app)
  //    .get('/api/v1/count?country=GB')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 20);
  //      assert.equal(res.body.results[0].country, "GB");
  //    });
  //  // cheks country id Caseinsensitive
  //  request(app)
  //    .get('/api/v1/count?country=Gb')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 20);
  //      assert.equal(res.body.results[0].country, "GB");
  //    });
  //  // checks ivalid country id
  //  request(app)
  //    .get('/api/v1/count?country=unknown')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //      assert.equal(res.body.results.length, 0);
  //    });
  //  request(app)
  //    .get('/api/v1/count?start=2016-06-01&end=2016-08-15')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //    	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-08-15"));
  //    });
  //  request(app)
  //    .get('/api/v1/count?start=2016-06-01&end=2016-08-15&page=1350')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //    	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-06-01"));
  //    });
  //  request(app)
  //    .get('/api/v1/count?start=2016-06-01&end=2016-08-15&page=700')
  //    .expect(200)
  //    .expect('Content-Type', /json/)
  //    .end(function(err, res) {
  //    	assert.deepEqual(new Date(res.body.results[0].date), new Date("2016-07-01"));
  //      done();
  //    });
  //});
});

describe('Helper functions', function() {
  it('Get table name by time granularity', function() {
    assert.equal(logic.getTableName('week'), 'agg_risk_country_week');
    assert.equal(logic.getTableName('month'), 'agg_risk_country_month');
    assert.equal(logic.getTableName('quarter'), 'agg_risk_country_quarter');
    assert.equal(logic.getTableName('year'), 'agg_risk_country_year');
  });
  it('Handles with wrong granularity', function() {
    assert.equal(logic.getTableName('wrong'), undefined);
  });
});
