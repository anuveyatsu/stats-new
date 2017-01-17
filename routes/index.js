var config = require('../config');
var logic = require('../logic');

// home page
exports.home = function(req, res) {
  logic.getDates().then(function(results){
    var date = results[0][0].date;
    var map = {
      embed_width: '100%',
      embed_height: '550px',
      current_year: date,
      filter_risk: 'openntp',
      embed_title: 'openntp'+' / '+ date,
      panel_tools: true
    };
    config.page = 'Home';
    res.render('home.html', {map: map, config: config});  
  }).catch(function(err) {
    res.json({error: err.message});
  });
};

// places
exports.place = function(req, res) {
  logic.getDates().then(function(dates) {
    return dates[0][0];
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (second_week) {
    logic.getAggregatedEntries({date: second_week.date}).then(function(entries) {
      countries = logic.getCountsForCountry(entries[0]);
      return countries;
    }).catch(function(err) {
      res.json({error: err.message});
    }).then(function (country_options) {
      logic.getTotalCountsByDate().then(function (countsByDate) {
        return countsByDate[0];
      }).catch(function(err){
        res.json({error: err.message});
      }).then(function (graphOptions) {
        logic.getRisks().then(function (risks) {
          risks = risks[0];
          config.page = 'Countries';
          var parameters = {
            countryOpt: country_options,
            riskOpt: risks,
            config: config,
            //this is temporary HACK
            graphData: JSON.stringify(graphOptions), 
            graphRisks: JSON.stringify([{id: 'count_amplified'}])
          };
          res.render('places.html', parameters);
        }).catch(function(err) {
          res.json({error: err.message});
        });
      });
    });
  });
};


exports.placeID = function(req, res) {
  logic.getDates().then(function(dates){
    return dates[0][0];
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (second_week) {
    var options = {
      date: second_week.date,
      country: req.params.id.toLowerCase()
    };
    logic.getAggregatedEntries(options).then(function(entries) {
      if(!entries[0].length) {
        res.render('404.html');
        return;
      }
      var id = entries[0][0].country_id;
      var date = entries[0][0].date;
      logic.getAsnCount(id, date).then(function(asnCounts) {
        var asns = {};
        var risks = {};
        asnCounts[0].forEach(function(result){
          if (asns[result.asn]){
            asns[result.asn].asn = result.asn;
            asns[result.asn][result.risk] = {
              count: result.count,
              af_count: result.count_amplified
            };
          }else {
            asns[result.asn] = {};
            asns[result.asn].asn = result.asn;
            asns[result.asn][result.risk] = {
              count: result.count,
              af_count: result.count_amplified
            };
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
          asnList.push(asns[asn]);
        }
        var result = {asnList: asnList, riskList: risks};
        return result;
    }).catch(function(err) {
      res.json({error: err.message});
    }).then(function(asns){
        logic.getRisks().then(function (risks) {
          risks = risks[0];
          // adds risk in Table if there is no data For given country
          var isRisk = false;
          var riskMap = {};
          var treeList = [];
          var riskEntries = entries[0];
          risks.forEach(function(risk){
            riskMap[risk.id] = risk.slug;
            riskEntries.forEach(function(res){
              if(risk.id === res.risk){
                isRisk = true;
              }
            });
            if (!isRisk){
              riskEntries.push({risk_title: risk.title, risk: risk.slug});
            }
            isRisk = false;
          });
          for (var risk in asns.riskList){
            var obj = Object.assign({name: riskMap[risk]}, {children: asns.riskList[risk]});
            treeList.push(obj);
          }
          var map = {
            embed_width: '100%',
            embed_height: '360px',
            current_year: riskEntries[0].date,
            filter_risk: 'openntp',
            embed_title: 'openntp' + ' / ' + riskEntries[0].date,
            panel_tools: true,
            panel_share: false,
            map_place: riskEntries[0].country_id.toLowerCase()
          };
          config.page = riskEntries[0].country_id;
          var parameters = {
            options: riskEntries,
            asns: asns.asnList.slice(0, 5000),
            treeAsn: JSON.stringify(treeList),
            riskOpt: risks, map: map,
            config: config
          };
          res.render('place.html', parameters);
        }).catch(function(err) {
        res.json({error: err.message});
        });
      });
    });
  });
};

exports.placeASN = function(req, res) {

  logic.getEntriesByASN(req.params.asn).then(function(results){
    var dates = {};
    results[0].forEach(function (entry){
      if (dates[entry.date]){
        dates[entry.date][entry.risk] = parseInt(entry.count);
        dates[entry.date].month = entry.date;
      } else {
        dates[entry.date] = {};
        dates[entry.date][entry.risk] = parseInt(entry.count);
        dates[entry.date].month = entry.date;
      } 
    });
    var entriesByDate = [];
    for (var date in dates){
      entriesByDate.push(dates[date]);
    }
    return entriesByDate;

  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function(entriesByDate){
  	logic.getRisks().then(function (risks) {
			risks = risks[0];
      config.page = req.params.asn;
			var parameters = {
				entries: entriesByDate, 
				graphData: JSON.stringify(entriesByDate), 
				page: {name: req.params.country, asn: req.params.asn}, 
				config: config, 
				risks: risks,
				graphRisks: JSON.stringify(risks)
			};
			res.render('place_asn.html', parameters);
		}).catch(function(err) {
    res.json({error: err.message});
    });
  });
};

// risks
exports.risk = function(req, res) {
	logic.getDates().then(function(dates){
    return dates[0][0];
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (second_week){
    logic.getRiskCount({date: second_week.date}).then(function(results){
      var result = results[0];
      config.page = 'Risks';
      var parameters = {options: result, config: config};
      res.render('risks.html', parameters);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};

exports.riskID = function(req, res) {
  logic.getDates().then(function(dates){
    return dates[0][0];
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (second_week){
    logic.getAggregatedEntries({date: second_week.date, risk: req.params.id}).then(function(results){
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
      config.page = result[0].risk_title;
      var parameters = {options: result,  map: map, config: config};
      res.render('risk.html', parameters);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};

// place-id/risk-id
exports.placeRisk = function(req, res) {
  logic.getDates().then(function(dates){
    return dates[0][0];
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (second_week){
    logic.getAggregatedEntries({date: second_week.date, risk: req.params.risk, country: req.params.country}).then(function(results){
  
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
      config.page = result.country_id + '-' + result.risk_title;
      res.render('place_risk.html', {options: result, map: map, config: config});
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};

// download
exports.download = function(req, res) {
  config.page = 'Download & API';
  res.render('download.html', {config: config});
};

// about
exports.about = function(req, res) {
  config.page = 'About';
  res.render('about.html', {config: config});
};


// map
exports.map = function(req, res) {
  logic.getDates().then(function(results){
    var dates = [];
    results[0].forEach(function(date){
      dates.push(date.date);
    });
    config.page = 'Map';
    res.render('map.embed.html', { config: config, dates: JSON.stringify(dates)});  
  }).catch(function(err) {
    res.json({error: err.message});
  });
};

// asn

exports.asn = function(req, res) {
  logic.getAsnTotal().then(function(results){
    config.page = 'ASN';
    res.render('asn.html', {asnCount: results[0], config: config});
  }).catch(function(err) {
    res.json({error: err.message});
  });
};

// api
exports.apiRisk = function(req, res) {
	if (Object.keys(req.params).length) { 
    logic.getRiskAPI(req.params).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  } else {
    logic.getRiskAPI(req.query).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  }
};

exports.apiCountry = function(req, res) {
  // handles with query and /{id} for REST
  if (Object.keys(req.params).length) { 
    logic.getCountryAPI(req.params).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  } else {
    logic.getCountryAPI(req.query).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  }
};

exports.apiAsn = function(req, res) {
  // handles with query and /{asn} for REST
  if (Object.keys(req.params).length) { 
    logic.getAsnAPI(req.params).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  } else {
    logic.getAsnAPI(req.query).then(function(results){
      res.json(results[0]);
    }).catch(function(err) {
      res.json({error: err.message});
    });
  }
};


exports.apiCountByCountry = function(req, res) {
	var queryOptions = {
    country: req.query.country || "", risk: req.query.risk || "",
    start: req.query.start || "", end: req.query.end || "",
    limit:checkLimit(req.query.limit) || "20", page: req.query.page || 1
  };
  req.query.page = queryOptions.page;
  req.query.limit = checkLimit(queryOptions.limit);
  queryOptions.country = queryOptions.country.toLowerCase();
  
  logic.getRowCountBYCountry(queryOptions).then(function(results) {
    return results[0][0].count;
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (rows) {
    queryOptions.offset = queryOptions.limit*(queryOptions.page-1);
    var totalPages = Math.ceil(rows / queryOptions.limit);
    var pages = checkCurrentPage(parseInt(queryOptions.page), totalPages, req.route.path, req.query);
    
    logic.getCountByCountry(queryOptions).then(function(results){
      res.json({
        status: "ok",
        number_of_data_results: rows,
        page: req.baseUrl+pages.curPage,
        total_pages: totalPages,
        next_page: req.baseUrl+pages.nextPage,
        status_code: 200,
        version: "1.2",
        cached: false,
        see_also: [],
        time: new Date().toISOString(),
        results: results[0]
      });
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};

exports.apiCount = function(req, res) {
  var queryOptions = {
    country: req.query.country || "", risk: parseInt(req.query.risk) || -1, asn: parseInt(req.query.asn) || -1,
    start: req.query.start || "", end: req.query.end || "",
    limit:checkLimit(req.query.limit) || "20", page: req.query.page || 1
  };
  queryOptions.country = queryOptions.country.toLowerCase();
  req.query.page = queryOptions.page;
  req.query.limit = checkLimit(queryOptions.limit);
  
  logic.getRowCount(queryOptions).then(function(results) {
    return results[0][0].count;
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (rows){
    queryOptions.offset = queryOptions.limit*(queryOptions.page-1);
    var totalPages = Math.ceil(rows / queryOptions.limit);
    var pages = checkCurrentPage(parseInt(queryOptions.page), totalPages, req.route.path, req.query);
    
    logic.getTotalCount(queryOptions).then(function(results){ 
      res.json({
        status: "ok",
        number_of_data_results: rows,
        page: req.baseUrl+pages.curPage,
        total_pages: totalPages,
        next_page: req.baseUrl+pages.nextPage,
        status_code: 200,
        version: "1.2",
        cached: false,
        see_also: [],
        time: new Date().toISOString(),
        results: results[0]
      });
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};

exports.geo = function(req, res) {
  var geoJson = require('../data/geo.json');
  res.json(geoJson);
};

function checkLimit(limit){
    if (parseInt(limit) > 500){
      return '500'; 
    } 
    return limit;
}

function checkCurrentPage(current, max, url, args){
  if (current < max){
    return {curPage: makeURL(url, args), nextPage: makeURL(url, args).replace("page="+current, "page="+(current+1))};
  } else if (current === max) {
    return {curPage: makeURL(url, args), nextPage: null};
  } else {
    return {curPage: null, nextPage: null};
  }
}

function makeURL(path, args) {
  path = path+'?';
  for (var arg in args){
    path += (arg + "=" + args[arg]+"&");
  }
  return path;
}
