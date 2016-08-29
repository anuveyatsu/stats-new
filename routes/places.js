var config = require('./../config');

module.exports = function(app) {
    app.get('/place', function(req, res) {
        var entries = config.scope.entries;
        var places = config.scope.places;
        var risks = config.scope.risks;
        var result = [];
        
        places.forEach(function(place){
            if (place.id){
                var row = {title: place.name, slug: place.slug, risks_scores: []};
                risks.forEach(function(risk){
                    if (risk.id){
                        var risk_score = '';
                        entries.forEach(function(entry){
                            if(place.id === entry.place && risk.id === entry.risk){
                            risk_score = entry.score;	
                            }
                        });
                        row.risks_scores.push(risk_score);
                    }
                });
                result.push(row);
            }
        });
        res.render('places.html', {entries: result, risks: risks});
    });
        
    app.get('/place/:id', function(req, res){
        config.scope.place = {name: req.params.id};
        res.render('place.html', config);
    });
}
