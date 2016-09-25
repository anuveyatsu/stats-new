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
    current_year: '2016-08-12',
    filter_risk: 'openntp',
    embed_title: 'openntp' + ' / ' + '2016-08-12',
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
					current_year: '2016-08-12',
					filter_risk: 'openntp',
					embed_title: 'openntp' + ' / ' + '2016-08-12',
					panel_tools: true,
					panel_share: false,
					map_place: result[0].place_id.toLowerCase()
				};
				config.updates = updates;
				// adds risk in Table if there is no data For given country
				var isRisk = false
				risks.forEach(function(risk){
					result.forEach(function(res){
						if(risk.id === res.risk){
							isRisk = true
						}
					})
					if (!isRisk){
						result.push({risk_title: risk.title, risk: risk.id})
					}
					isRisk = false
				})
				res.render('place.html', {options: result, asns: asnList, riskOpt: risks, config: config});
			});
  	});
 	});
};

exports.placeASN = function(req, res) {

  logic.getEntriesFromDatabase(sequelize, 'entries	', {	asn: req.params.asn}).then(function(results){
    
    var dates = {};
   
    results[0].forEach(function (entry){
      if (dates[entry.date]){
        dates[entry.date][entry.risk] = entry.count || 'N/A';
      } else {
        dates[entry.date] = {};
        dates[entry.date][entry.risk] = entry.count || 'N/A';
      }
    });
    var result = [];
    for (var date in dates){
      var obj = Object.assign({month: date}, dates[date]);
      result.push(obj);
    }
    return result
    
  }).then(function(result){
  	logic.getEntriesFromDatabase(sequelize, 'risks').then(function (risks) {
			risks = risks[0]
			options = {
				entries: result, 
				graphData: JSON.stringify(result), 
				page: {name: req.params.place, asn: req.params.asn}, 
				config: config, 
				risks: risks,
				graphRisks: JSON.stringify(risks)
			}
			res.render('place_asn.html', options);
		});
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
  
  logic.getPlaceScore(sequelize, {risk: req.params.id}).then(function(results){
  	var result = results[0];
  	var updates = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: result[0].date,
		  filter_risk: req.params.id,
		  embed_title: req.params.id + ' / ' + result[0].date,
		  panel_tools: false,
		  panel_share: false,
		};
		config.updates = updates;
  	res.render('risk.html', {options: result,  config: config});
  })
};

// place-id/risk-id
exports.placeRisk = function(req, res) {

  logic.getPlaceScore(sequelize, {risk: req.params.risk, place: req.params.place}).then(function(results){

  	var result = results[0][0];
  	var updates = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: result.date,
		  filter_risk: req.params.risk,
		  embed_title: req.params.risk + ' / ' + result.date,
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

  logic.getAsnTotal(sequelize, 'country_asn').then(function(results){

                res.render('asn.html', {asnCount: results[0], config: config});
  })
};

// api
exports.apiCountByCountry = function(req, res) {

	logic.getCountByCountry(sequelize, req.query).then(function(results){
  	res.json(results[0]);
  });
}

exports.apiCountByCountry = function(req, res) {

	logic.getCountByCountry(sequelize, req.query).then(function(results){
  	res.json(results[0]);
  });
}

exports.apiRisk = function(req, res) {

	logic.getEntriesFromDatabase(sequelize, 'risks', req.query).then(function(results){
  	res.json(results[0]);
  });
}

exports.apiCountry = function(req, res) {

	logic.getEntriesFromDatabase(sequelize, 'places', req.query).then(function(results){
  	res.json(results[0]);
  });
}

exports.apiAsn = function(req, res) {

	logic.getEntriesFromDatabase(sequelize, 'country_asn', req.query).then(function(results){
  	res.json(results[0]);
  });
}

exports.apiCount = function(req, res) {

	logic.getTotalCount(sequelize, req.query).then(function(results){
  	res.json(results[0]);
  });
}

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
