var express = require('express');
var nunjucks = require('nunjucks');
var markdown = require('nunjucks-markdown');
var marked = require('marked');
//routes
var routes = require('./routes');

var app = express();
app.set('port', process.env.PORT || 8000);

app.use(express.static(__dirname + '/public'));

var env = new nunjucks.configure(__dirname + '/views', {
    autoescape: false,
    express: app
});
// registering markdown 
markdown.register(env, marked);

app.get('/', routes.home);
app.get('/place', routes.place);
app.get('/place/:id', routes.placeID);
app.get('/place/:place/asn/:asn', routes.placeASN);
app.get('/place/:place/:risk', routes.placeRisk);
app.get('/risk', routes.risk);
app.get('/risk/:id', routes.riskID);
app.get('/download', routes.download);
app.get('/about', routes.about);
app.get('/vis/map/embed', routes.map);
app.get('/api/:id'+'.json', routes.api);
app.get('/data/geo.json', routes.geo);
app.get('/asn', routes.asn);

app.get('/api/v1/count_by_country', routes.apiCountByCountry);

app.listen(app.get('port'), function() {
  console.log('Listening on: ' + app.get('port'));
});

exports.app = app;
