var config = require('../config');
var logic = require('../logic');

var Sequelize = require('sequelize');

var entries = config.data.entries;
var places = config.data.places;
var risks = config.data.risks;

var mapRisks = [{id: '1', title: 'Open DNS'}, {id: '2', title: 'Open NTP'}, {id: '4', title : 'Open SNMP'}]

if (process.env.DATABASE_URI) {
  // Use DATABASE_URL if it exists, for Heroku.
  sequelize = new Sequelize(process.env.DATABASE_URI, {})
} else {
  // Fallback to normal config, for local development and test environments.
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db);
}

// home page
exports.home = function(req, res) {
  var updates = {
    embed_width: '100%',
    embed_height: '300px',
    current_year: 2016,
    filter_risk: config.data.risks[0].id,
    embed_title: config.data.risks[0].id + ' / ' + 2016
  };
  config.updates = updates;
  res.render('home.html', {config: config});
};

// places
exports.place = function(req, res) {
  
  logic.getPlaceScore(sequelize).then(function(results){
  	var places = {};
  	results[0].forEach(function(result){
  		if (places[result.name]){
  			places[result.name][result.risk] = result.score
  			places[result.name]['slug'] = result.slug
  		}else{
  			places[result.name] = {}
  			places[result.name][result.risk] = result.score
  			places[result.name]['slug'] = result.slug
  		}
  	});
  	var result = [];
    for (var place in places){
      var obj = Object.assign({name: place}, places[place]);
      result.push(obj);
    };
    res.render('places.html', {options: result, riskOpt: mapRisks, config: config});
  });
};

exports.placeID = function(req, res) {
  
  logic.getPlaceScore(sequelize, req.params.id).then(function(results){
  	var result = results[0]
		var updates = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: 2016,
		  filter_risk: config.data.risks[0].id,
		  embed_title: config.data.risks[0].id + ' / ' + 2016,
		  panel_tools: true,
		  panel_share: false,
		  map_place: result[0].place_id.toLowerCase()
		};
		config.updates = updates;
		res.render('place.html', {options: result, config: config});
  });
};

exports.placeASN = function(req, res) {
  var place = getMatchedEntry(places, 'slug', req.params.place);
  place.asn = req.params.asn;  
  logic.getEntriesFromDatabase(sequelize, {place: place.id, asn: place.asn}).then(function(results){
    var dates = {};
    var mapRisks = {'1': 'openntp', '2': 'opendns'};
    results[0].forEach(function (entry){
      if (dates[entry.date]){
        dates[entry.date][mapRisks[ntry.risk]] = entry.count || 'N/A';
      } else {
        dates[entry.date] = {};
        dates[entry.date][mapRisks[entry.risk]] = entry.count || 'N/A';
      }
    });
    var result = [];
    for (var date in dates){
      var obj = Object.assign({month: date}, dates[date]);
      result.push(obj);
    }
    res.render('place_asn.html', {entries: result, graphData: JSON.stringify(result), config: config, page: place, risks: risks});
  });
};

// risks
exports.risk = function(req, res) {
	// TODO: risks table needs primary key for risks
	// TODO: needs to be computed: min, score
  sequelize.query('SELECT * FROM risks;').then(function(results){
  	var result = results[0]
  	res.render('risks.html', {options: result, config: config});
  })
};

exports.riskID = function(req, res) {
  var result = [];
  var riskOptions = getMatchedEntry(risks, 'id', req.params.id);
  
  entries.forEach(function(entry) {
    if (entry.risk === req.params.id){
      var placeOptions = getMatchedEntry(places, 'id',entry.place);
      var options = {
        rank: entry.rank,
        score: entry.score,
        slug: placeOptions.slug,
        riskId: riskOptions.id,
        placeName: placeOptions.name,
        count: entry.count,
        placeID: placeOptions.id
      };
      result.push(options);
    }
  });

  var updates = {
    embed_width: '100%',
    embed_height: '360px',
    current_year: 2016,
    filter_risk: req.params.id,
    embed_title: req.params.id + ' / ' + 2016,
    panel_tools: false,
    panel_share: false,
  };
  config.updates = updates;
  res.render('risk.html', {options: result, riskOpt: riskOptions, config: config});
};

// place-id/risk-id
exports.placeRisk = function(req, res) {
  var place = getMatchedEntry(places, 'slug', req.params.place);
  var risk = getMatchedEntry(risks, 'id', req.params.risk);
  var entry;
  entries.forEach(function(line){
    if(line.place === place.id && line.risk === risk.id ){
      entry = line;
    }
  });
  
  var updates = {
    embed_width: '100%',
    embed_height: '360px',
    current_year: 2016,
    filter_risk: req.params.risk,
    embed_title: req.params.risk + ' / ' + 2016,
    map_place: place.id,
    panel_tools: false,
    panel_share: false,
  };
  config.updates = updates;
  res.render('place_risk.html', {place: place, risk: risk, entry: entry, config: config});
};

// download

exports.download = function(req, res) {
  res.render('download.html', {config: config});
};

// about

exports.about = function(req, res) {
  res.render('about.html', {config: config});
};


// map
exports.map = function(req, res) {
  res.render('map.embed.html', {config: config});
};

// asn

exports.asn = function(req, res) {
  var updates = {
    embed_width: '100%',
    embed_height: '400px',
  };
  config.updates = updates;
  res.render('asn.html', {config: config});
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

function getMatchedEntry(data, matchWith, matchTo){
  var result = {};
  data.forEach(function(entry){
    if(entry[matchWith] === matchTo ){
      result = entry;
    }
  });
  return result;
}
