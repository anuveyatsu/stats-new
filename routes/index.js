var config = require('../config');

exports.home = function(req, res) {
    res.render('home.html', config);
};

// places
exports.place = function(req, res) {
    
    var entries = config.scope.entries;
    var places = config.scope.places;
    var risks = config.scope.risks;
    var result = [];
    
    places.forEach(function(place) {
        if (place.id) {
            var row = {title: place.name, slug: place.slug, risks_scores: []};
            risks.forEach(function(risk) {
                if (risk.id){
                    var risk_score = '';
                    entries.forEach(function(entry) {
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
};

exports.placeID = function(req, res) {
    config.scope.place = {name: req.params.id};
    res.render('place.html', config);
};

// risks
exports.risk = function(req, res) {
    res.render('risks.html', config);
};

exports.riskID = function(req, res) {
    config.scope.risk = {title: req.params.id};
    res.render('risk.html', config);
};

// map
exports.map = function(req, res) {
    res.render('map.embed.html', config);
};

// api
exports.api = function(req, res) {
    if (config.scope[req.params.id]) {
        res.json(config.scope[req.params.id]);
    } else {
        
        res.send('Request not found');
    }
};

exports.geo = function(req, res) {
    var geoJson = require('../data/geo.json');
    res.json(geoJson);
};

exports.asn = function(req, res) {
    var entries = config.scope.asn;
    var places = config.scope.places;
    var risks = config.scope.risks;
    var place = req.params.id;
    var result = [];

    entries.forEach(function(entry) {
        if (place === entry.place) {
            obj = {time: entry.time, count: entry.count, asn: entry.asn};
            places.forEach(function(country) {
                if(place === country.id) {
                    obj.place = country.name;
                }
            });
            risks.forEach(function(risk) {
                if(entry.risk === risk.id) {
                    obj.risk = risk.title;
                }
            });
            result.push(obj);	
        }
    });
    
    res.render('asn.html', {entries: result, graphData: JSON.stringify(result)});
};