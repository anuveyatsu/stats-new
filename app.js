var express = require('express');
var nunjucks = require('nunjucks');
var markdown = require('nunjucks-markdown');
var marked = require('marked');
//routes
var routes = require('./routes');

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(express.static(__dirname + '/public'));

var env = new nunjucks.configure(__dirname + '/views', {
    autoescape: false,
    express: app
});
// registering markdown 
markdown.register(env, marked);

app.get('/', routes.home);
app.get('/country', routes.place);
app.get('/country/:id', routes.placeID);
app.get('/country/:country/asn/:asn', routes.placeASN);
app.get('/country/:country/:risk', routes.placeRisk);
app.get('/risk', routes.risk);
app.get('/risk/:id', routes.riskID);
app.get('/download', routes.download);
app.get('/about', routes.about);
app.get('/vis/map/embed', routes.map);
app.get('/data/geo.json', routes.geo);
app.get('/asn', routes.asn);
// API
app.get('/api/v1/count_by_country', routes.apiCountByCountry);
app.get('/api/v1/risk', routes.apiRisk);
app.get('/api/v1/risk/:id', routes.apiRisk);
app.get('/api/v1/country', routes.apiCountry);
app.get('/api/v1/country/:id', routes.apiCountry);
app.get('/api/v1/asn', routes.apiAsn);
app.get('/api/v1/asn/:asn', routes.apiAsn);
app.get('/api/v1/count', routes.apiCount);
// API redirects
app.get('/api/count_by_country', function(req, res){
  res.redirect('/api/v1/count_by_country');
});
app.get('/api/risk', function(req, res){
  res.redirect('/api/v1/risk');
});
app.get('/api/country', function(req, res){
  res.redirect('/api/v1/country');
});
app.get('/api/asn', function(req, res){
  res.redirect('/api/v1/asn');
});
app.get('/api/count', function(req, res){
  res.redirect('/api/v1/count');
});

app.listen(app.get('port'), function() {
  console.log('Listening on: ' + app.get('port'));
});

exports.app = app;
