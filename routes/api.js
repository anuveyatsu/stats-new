var config = require('./../config');

module.exports = function(app) {
    app.get('/api/:id'+'.json', function(req, res) {
        if (config.scope[req.params.id]) {
            res.json(config.scope[req.params.id]);
        } else {
            res.send('Request not found');
        }
    });
    app.get('/data/geo.json', function(req, res) {
        res.json(config.scope.geo);
    });
}