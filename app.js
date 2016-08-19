var nunjucks = require('nunjucks');
var express = require('express');
var fs = require('fs');
var app = express();
var config = require('./config');
var Papa = require('babyparse');
var port = 8000;

// loads data
var riskCsv = fs.readFileSync(__dirname + '/content/data/risks.csv', 'utf8');
var placeCsv = fs.readFileSync(__dirname + '/content/data/places.csv', 'utf8');
var entryCsv = fs.readFileSync(__dirname + '/content/data/entries.csv', 'utf8');
// transfoms csv to json
var risks = Papa.parse(riskCsv, {header: true}).data;
var places = Papa.parse(placeCsv, {header: true}).data;
var entries = Papa.parse(entryCsv, {header: true}).data;



app.use(express.static(__dirname + '/theme'));

var env = new nunjucks.configure(__dirname + '/theme/templates', {
    autoescape: false,
    express: app
});
// filters entries 
env.addFilter('search', function(self, options) {

    var result = {};
    var keys = Object.keys(options);
    var test = '';
    // constructs condition to test, depending on options' values
    keys.forEach(function(item, index){
        if (index < 1) {
            test = test + 'item.' + item + '===options.' + item;
        } else {    
            test = test + '&&'+'item.' + item + '===options.' + item;
        }
    });
    self.forEach(function(item){
        if (eval(test)){
            result = item;
        }
    });
    
    return result;
});

app.get('/', function(req, res) {
    res.render('index.html', config);
});

app.get('/place', function(req, res) {
    config.scope = {};
    config.scope.risks = risks;
    config.scope.places = places;
    config.scope.entries = entries;
    res.render('places.html', config);
});

app.get('/place/:id', function(req, res){
    config.scope = {};
    config.scope.place = {name: req.params.id};
    config.scope.risks = risks;
    config.scope.places = places;
    config.scope.entries = entries;
    res.render('place.html', config);
});

app.listen(port, function() {
    console.log('Listening on: ' + port);
});

exports.app = app;