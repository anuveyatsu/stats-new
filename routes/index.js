var config = require('../config');
var logic = require('../logic');

// home page
exports.home = function(req, res) {
  logic.getRisks().then(function (risks) {
    var graphData = [];
    risks[0].forEach(function (risk) {
      if (risk.id!==100) {
        graphData.push({
          url: '/api/v1/count_by_country?country=T&limit=500&page=1&risk=' + risk.id,
          name: risk.title
        });
      }
    });
    return graphData

  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (graphData) {
    logic.getCountries().then(function (countries) {
      var countriesToSearch = {}
      countries[0].forEach(function (country) {
        countriesToSearch[country.id] = country
      })
      config.page = 'Home';
      res.render('home.html', {
        graphData: JSON.stringify(graphData),
        countries: JSON.stringify(countriesToSearch),
        config: config});
    })
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
          config.page = 'Country Overview';
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
  logic.getCountries().then(function(countries) {
    var country = countries[0].find(function(country) {
      return country.slug === req.params.id.toLowerCase()
    })
    if(!country){res.render('404.html');}

    var countriesToSearch = {}
    countries[0].forEach(function (country) {
      countriesToSearch[country.id] = country
    })
    return {countriesToSearch: countriesToSearch, country: country}
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function(countries) {
    logic.getRisks().then(function(risks) {
      var countryPerformanceOnRiskViews = {}
      risks[0].forEach(function(risk) {
        var countryID = countries.country.id
        var riskID = risk.id
        countryPerformanceOnRiskViews[countryID+'/'+riskID] = {
          id: countryID+'/'+riskID,
          country: countryID, risk: riskID,
          type: 'country/performance',
          isFetched: false,
          isFetching: false,
          didFailed: false,
          measure: "count_normalized",
          selectorConfig: [
            {disabled: true, country: countryID},
            {disabled: true, country: 'T'},
            {disabled: false, country: undefined},
            {disabled: false, country: undefined},
            {disabled: false, country: undefined}
          ]
        }
      })
      config.page = countries.country.name;
      var parameters = {
        countryOptions: countries.country,
        countryPerformanceOnRiskViews: JSON.stringify(countryPerformanceOnRiskViews),
        countries: JSON.stringify(countries.countriesToSearch),
        config: config
      };
      res.render('place.html', parameters);
    }).catch(function(err) {
      res.json({error: err.message})
    })
  })
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
      config.page = 'AS ' + req.params.asn + ' - ' + req.params.country;
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
      config.page = 'Risk Statistics';
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
      config.page = result[0].risk_title + ' Risk Statistics';
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
      config.page = result.risk_title + ' - ' + result.name;
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
    config.page = 'AS (Autonomous System) Overview';
    res.render('asn.html', {asnCount: results[0], config: config});
  }).catch(function(err) {
    res.json({error: err.message});
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

function normalize(entries, date) {
  clone = entries.slice()
  var normalizer = clone.find(function(entry){
    return entry.date === date
  })
  if (!normalizer){ return }
  clone.map(function(entry) {
    return entry.count_normalized = Math.round(entry.count/(normalizer.count/100) *100) /100
  })
  return clone
}
