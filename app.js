var nunjucks = require('nunjucks');
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 8000;
var config = require('./config')



app.use(express.static(path.join(__dirname, 'theme')));

nunjucks.configure(path.join(__dirname, 'theme/templates'), {
    autoescape: false,
    express: app
});

app.get('/', function(req, res) {
    res.render('index.html', config);
});

app.get('/place', function(req, res) {
    res.render('place.html', config)
})

app.listen(port, function() {
    console.log('Listening on: ' + port);
});

