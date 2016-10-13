var config = require('../config');
var logic = require('../logic');

// home page
exports.home = function(req, res) {
  var map = {
    embed_width: '100%',
    embed_height: '550px',
    current_year: '2016-08-15',
    filter_risk: 'opendns',
    embed_title: 'opendns' + ' / ' + '2016-08-15',
    panel_tools: true
  };
  res.render('home.html', {map: map, config: config});
};

// places
exports.place = function(req, res) {

  logic.getScores().then(function(results){
  	var places = {};
  	results[0].forEach(function(result){
  		if (places[result.name]){
  			places[result.name][result.risk] = result.score;
  			places[result.name]['slug'] = result.slug;
  		}else{
  			places[result.name] = {};
  			places[result.name][result.risk] = result.score;
  			places[result.name]['slug'] = result.slug;
  		}
  	});
  	var result = [];
    for (var place in places){
      if (Object.keys(places[place]).length > 3) {
        var obj = Object.assign({name: place}, places[place]);
        result.push(obj);
      }
    }
    return result;
  }).then(function (result) {
  	logic.getRisks().then(function (risks) {
  		risks = risks[0];
      var parameters = {
        options: result,
        riskOpt: risks,
        config: config
      };
  		res.render('places.html', parameters);
  	});
  });
};

exports.placeID = function(req, res) {
  
  logic.getScores({country: req.params.id}).then(function(results){
    if(!results[0].length){
      res.render('404.html');
      return;
    }
    return results[0];
  }).then(function(result) {
  	var id = result[0].country_id;
  	logic.getAsnCount(id).then(function(results) {
  		var asns = {};
  		var risks = {};
			results[0].forEach(function(result){
				if (asns[result.asn]){
					asns[result.asn][result.risk] = result.count;
				}else {
					asns[result.asn] = {};
					asns[result.asn][result.risk] = result.count;
				}
				if (risks[result.risk]){
					risks[result.risk].push({name: result.asn, count: result.count});
				}else{
					risks[result.risk] = [];
					risks[result.risk].push({name: result.asn, count: result.count});
				}
			});
			var asnList = [];
			for (var asn in asns){
			  var obj = Object.assign({asn: asn}, asns[asn]);
			  asnList.push(obj);
			}
			
			var result = {asnList: asnList, riskList: risks};
			return result;
  	}).then(function(asns){
  		logic.getRisks().then(function (risks) {
				risks = risks[0];
				// adds risk in Table if there is no data For given country
				var isRisk = false;
				var riskMap = {};
        var treeList = [];
        risks.forEach(function(risk){
					riskMap[risk.risk_id] = risk.id;
					result.forEach(function(res){
						if(risk.id === res.risk){
							isRisk = true;
						}
					});
					if (!isRisk){
						result.push({risk_title: risk.title, risk: risk.id});
					}
					isRisk = false;
				});
        //console.log(asns.riskList )
        for (var risk in asns.riskList){
          var obj = Object.assign({name: riskMap[risk]}, {children: asns.riskList[risk]});
          treeList.push(obj);
        }
        var map = {
					embed_width: '100%',
					embed_height: '360px',
					current_year: '2016-08-15',
					filter_risk: 'opendns',
					embed_title: 'opendsn' + ' / ' + '2016-08-15',
					panel_tools: true,
					panel_share: false,
					map_place: result[0].country_id.toLowerCase()
				};
        var parameters = {
          options: result,
          asns: asns.asnList.slice(0, 5000),
          treeAsn: JSON.stringify(treeList),
          riskOpt: risks, map: map,
          config: config
        };
        res.render('place.html', parameters);
			});
  	});
 	});
};

exports.placeASN = function(req, res) {

  logic.getEntriesByASN(req.params.asn).then(function(results){
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
    return result;
    
  }).then(function(result){
  	logic.getRisks().then(function (risks) {
			risks = risks[0];
			var parameters = {
				entries: result, 
				graphData: JSON.stringify(result), 
				page: {name: req.params.country, asn: req.params.asn}, 
				config: config, 
				risks: risks,
				graphRisks: JSON.stringify(risks)
			};
			res.render('place_asn.html', parameters);
		});
  });
};

// risks
exports.risk = function(req, res) {
	
  logic.getRiskCount().then(function(results){
  	var result = results[0];
    var parameters = {options: result, config: config};
  	res.render('risks.html', parameters);
  });
};

exports.riskID = function(req, res) {
  
  logic.getScores({risk: req.params.id}).then(function(results){
  	var result = results[0];
  	var map = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: result[0].date,
		  filter_risk: req.params.id,
		  embed_title: req.params.id + ' / ' + result[0].date,
		  panel_tools: false,
		  panel_share: false,
		};
    var parameters = {options: result,  map: map, config: config};
  	res.render('risk.html', parameters);
  });
};

// place-id/risk-id
exports.placeRisk = function(req, res) {

  logic.getScores({risk: req.params.risk, country: req.params.country}).then(function(results){

  	var result = results[0][0];
  	var map = {
		  embed_width: '100%',
		  embed_height: '360px',
		  current_year: result.date,
		  filter_risk: req.params.risk,
		  embed_title: req.params.risk + ' / ' + result.date,
		  map_place: result.country_id.toLowerCase(),
		  panel_tools: false,
		  panel_share: false,
		};
		res.render('place_risk.html', {options: result, map: map, config: config});
  });
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
  logic.getAsnTotal().then(function(results){
    res.render('asn.html', {asnCount: results[0], config: config});
  });
};

// api
exports.apiCountByCountry = function(req, res) {
	logic.getCountByCountry(req.query).then(function(results){
  	res.json(results[0]);
  });
};

exports.apiRisk = function(req, res) {
	if (Object.keys(req.params).length) { 
    logic.getRiskAPI(req.params).then(function(results){
      res.json(results[0]);
    });
  } else {
    logic.getRiskAPI(req.query).then(function(results){
      res.json(results[0]);
    });
  }
};

exports.apiCountry = function(req, res) {
  // handles with query and /{id} for REST
  if (Object.keys(req.params).length) { 
    logic.getCountryAPI(req.params).then(function(results){
      res.json(results[0]);
    });
  } else {
    logic.getCountryAPI(req.query).then(function(results){
      res.json(results[0]);
    });
  }
};

exports.apiAsn = function(req, res) {
  // handles with query and /{asn} for REST
  if (Object.keys(req.params).length) { 
    logic.getAsnAPI(req.params).then(function(results){
      res.json(results[0]);
    });
  } else {
    logic.getAsnAPI(req.query).then(function(results){
      res.json(results[0]);
    });
  }
};

exports.apiCount = function(req, res) {
	logic.getTotalCount(req.query).then(function(results){
  	res.json(results[0]);
  });
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
