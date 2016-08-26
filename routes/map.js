var config = require('./../config');

module.exports = function(app) {
    app.get('/vis/map/embed', function(req, res) {
        res.render('map.embed.html', config);
    });
}