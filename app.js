var express = require('express');
var nunjucks = require('nunjucks');
var markdown = require('nunjucks-markdown');
var marked = require('marked');
//routes
var routes = require('./routes');

var app = express();
var port = process.env.PORT || 8000;
app.use(express.static(__dirname + '/public'));

var env = new nunjucks.configure(__dirname + '/views', {
    autoescape: false,
    express: app
});
// registering markdown 
markdown.register(env, marked);
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

env.addFilter('where', function(self, options) {
    var result = [];
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
            result.push(item);
        }
    });
    return result;
});

app.get('/', routes.home);
app.get('/place', routes.place);
app.get('/place/:id', routes.placeID);
app.get('/risk', routes.risk);
app.get('/risk/:id', routes.riskID);
app.get('/vis/map/embed', routes.map);
app.get('/api/:id'+'.json', routes.api);
app.get('/data/geo.json', routes.geo);

app.listen(port, function() {
    console.log('Listening on: ' + port);
});




exports.app = app;