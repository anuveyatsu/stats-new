var config = require('./../config');

module.exports = function(app) {
    app.get('/place', function(req, res) {
        res.render('places.html', config);
    });
    
    app.get('/place/:id', function(req, res){
        config.scope.place = {name: req.params.id};
        res.render('place.html', config);
    });
}