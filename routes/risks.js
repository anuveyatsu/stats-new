var config = require('./../config');

module.exports = function(app){
    app.get('/risk', function(req, res) {
        res.render('risks.html', config);
    });
    
    app.get('/risk/:id', function(req, res){
        config.scope.risk = {title: req.params.id};
        res.render('risk.html', config);
    });
    
    app.get('/risk/asn/:month', function(req, res) {
        config.scope.month = req.params.month;
        config.scope.asn = asn;
        res.render('asn-month.html', config);
    });
};