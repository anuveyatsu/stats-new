var express = require('express');
var nunjucks = require('nunjucks');
//configurations
var config = require('./config');
//routes
var api = require('./routes/api');
var places = require('./routes/places');
var risks = require('./routes/risks');
var index = require('./routes/index');
var map = require('./routes/map')

var app = express();
var port = process.env.PORT || 8000;
app.use(express.static(__dirname + '/public'));

var env = new nunjucks.configure(__dirname + '/views', {
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

index(app);
places(app);
risks(app);
api(app);
map(app)

app.listen(port, function() {
    console.log('Listening on: ' + port);
});




exports.app = app;