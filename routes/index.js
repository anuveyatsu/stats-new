var config = require('../config');
var logic = require('../logic');
var Sequelize = require('sequelize');

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
    filter_risk: 'openntp',
    embed_title: 'openntp' + ' / ' + 2016,
    panel_tools: true
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
    return result
  }).then(function (result) {
  	logic.getEntriesFromDatabase(sequelize, 'risks').then(function (risks) {
  		risks = risks[0]
  		res.render('places.html', {options: result, riskOpt: risks, config: config});
  	})
		 
  });
};

exports.placeID = function(req, res) {
  
  logic.getPlaceScore(sequelize, {place: req.params.id}).then(function(results){
  	return results[0]	
  }).then(function(result) {
  	var id = result[0].place_id
  	logic.getAsnCount(sequelize, {place: id }).then(function(results) {
  		var asns = {};
			results[0].forEach(function(result){
				if (asns[result.asn]){
					asns[result.asn][result.risk] = result.count
				}else{
					asns[result.asn] = {}
					asns[result.asn][result.risk] = result.count
				}
			});
			var asnList = [];
			for (var asn in asns){
			  var obj = Object.assign({asn: asn}, asns[asn]);
			  asnList.push(obj);
			}
			return asnList
  	}).then(function(asnList){
  		logic.getEntriesFromDatabase(sequelize, 'risks').then(function (risks) {
				risks = risks[0]
				var updates = {
					embed_width: '100%',
					embed_height: '360px',
					current_year: 2016,
					filter_risk: 'openntp',
					embed_title: 'openntp' + ' / ' + 2016,
					panel_tools: true,
					panel_share: false,
					map_place: result[0].place_id.toLowerCase()
				};
				config.updates = updates;
				res.render('place.html', {options: result, asns: asnList, riskOpt: risks, config: config});
			});
  	});
 	});
};

exports.placeASN = function(req, res) {

  var place = getMatchedEntry(config.data.places, 'slug', req.params.place);
  
  place.asn = req.params.asn;
  logic.getEntriesFromDatabase(sequelize, 'entries	', {place: place.id, asn: place.asn}).then(function(results){
    var dates = {};
    var mapRisks = {'1': 'openntp', '2': 'opendns'};
    
    results[0].forEach(function (entry){
      if (dates[entry.date]){
        dates[entry.date][mapRisks[entry.risk]] = entry.count || 'N/A';
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
    
    res.render('place_asn.html', {entries: result, graphData: JSON.stringify(result), config: config, page: place});
  });
};

// risks
exports.risk = function(req, res) {
	// TODO: risks table needs primary key for risks
	// TODO: needs to be computed: min, score
  sequelize.query('SELECT * FROM risks;').then(function(results){
  	var result = results[0];
  	res.render('risks.html', {options: result, config: config});
  })
};

exports.riskID = function(req, res) {
  map = {opendns: 1, openntp: 2} 
  logic.getPlaceScore(sequelize, {risk: map[req.params.id]}).then(function(results){
  	
  	var result = results[0];
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
  	res.render('risk.html', {options: result, riskOpt: mapRisks, config: config});
  })
};

// place-id/risk-id
exports.placeRisk = function(req, res) {
  map = {opendns: 1, openntp: 2}
  logic.getPlaceScore(sequelize, {risk: map[req.params.risk], place: req.params.place}).then(function(results){

  	var result = results[0][0];
  	console.log(result)
  	var updates = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: 2016,
		  filter_risk: req.params.risk,
		  embed_title: req.params.risk + ' / ' + 2016,
		  map_place: result.place_id.toLowerCase(),
		  panel_tools: false,
		  panel_share: false,
		};
		config.updates = updates;
		res.render('place_risk.html', {options: result, config: config});
  })
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
