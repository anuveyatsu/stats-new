var config = require('../config');

exports.home = function(req, res) {
  res.render('home.html', config);
};

// places
exports.place = function(req, res) {
    
  var entries = config.data.entries;
  var places = config.data.places;
  var risks = config.data.risks;
  var result = [];
    
  places.forEach(function(place) {
    var row = {title: place.name, slug: place.slug, risks_scores: []};
    risks.forEach(function(risk) {
      var risk_score = '';
      entries.forEach(function(entry) {
        if(place.id === entry.place && risk.id === entry.risk){
        risk_score = entry.score;	
        }
      });
      row.risks_scores.push(risk_score);
    });
    result.push(row);
  });
  res.render('places.html', {entries: result, risks: risks});
};

exports.placeID = function(req, res) {
  config.place = {name: req.params.id};
  res.render('place.html', config);
};

// risks
exports.risk = function(req, res) {
  
  var entries = config.data.entries;
  var places = config.data.places;
  var risks = config.data.risks;
  var result = [];
  
  risks.forEach(function(risk) {
    var top_score = -1;
    var worst_score = 100;
    var options = {
      rank: risk.rank,
      score: risk.score,
      id: risk.id,
      title: risk.title,
      description: risk.description,
      topPlaces: [],
      worstPlaces: []
    };
    
    entries.forEach(function(entry) {
      if (entry.risk === risk.id){
        // collecting places best scores
        if (Number(entry.score) > top_score){
          top_score = entry.score;
          options.topPlaces = [];
          place = findPace(places, entry.place);
          options.topPlaces.push(place);
        } else if (Number(entry.score) === top_score) {
          top_score = entry.score;
          place = findPace(places, entry.place);
          options.topPlaces.push(place);
        }
        // colecting places with worst scores
        if (Number(entry.score) < worst_score){
          worst_score = entry.score;
          options.worstPlaces = [];
          place = findPace(places, entry.place);
          options.worstPlaces.push(place);
        } else if (Number(entry.score) === worst_score) {
          worst_score = entry.score;
          place = findPace(places, entry.place);
          options.worstPlaces.push(place);
        }
      }
    });
    result.push(options);
  });
  res.render('risks.html', {risks: result});
};
  
function findPace(data, place){
  var result = {};
  data.forEach(function(entry){
    if(entry.id === place ){
      result = entry;
    }
  });
  return result;
}

exports.riskID = function(req, res) {
  config.risk = {title: req.params.id};
  res.render('risk.html', config);
};

// map
exports.map = function(req, res) {
  res.render('map.embed.html', config);
};

// api
exports.api = function(req, res) {
  if (config.data[req.params.id]) {
    res.json(config.data[req.params.id]);
  } else {
    res.send('Request not found');
  }
};

exports.geo = function(req, res) {
  var geoJson = require('../data/geo.json');
  res.json(geoJson);
};

exports.asn = function(req, res) {
  var entries = config.data.asn;
  var places = config.data.places;
  var risks = config.data.risks;
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