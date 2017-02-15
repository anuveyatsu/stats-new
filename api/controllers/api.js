var logic = require('../../logic');

module.exports = {
  apiCountByCountry: apiCountByCountry,
  apiCount: apiCount,
  apiRisk: apiRisk,
  apiCountry: apiCountry,
  apiAsn: apiAsn
};

function apiCountByCountry(req, res) {
  var queryOptions = {
    country: req.query.country || "", risk: parseInt(req.query.risk) || -1,
    start: req.query.start || "", end: req.query.end || "",
    limit: checkLimit(req.query.limit) || 20,
    page: req.query.page || 1,
    granularity: req.query.granularity || 'week'
  };
  queryOptions.country = queryOptions.country.toUpperCase();
  queryOptions.offset = queryOptions.limit*(queryOptions.page-1);
  try {
    logic.getRowCountBYCountry(queryOptions).then(function(results) {
      return results[0][0].count;
    }).catch(function(err) {
      res.json({error: err.message});
    }).then(function (rows) {
      logic.getCountByCountry(queryOptions).then(function(CountByCountry){
        var normalized;
        if (queryOptions.risk !== -1 && queryOptions.country && queryOptions.granularity === 'week') {
          normalized = normalize(CountByCountry[0], '2017-01-02');
        }
        res.json({
          total: rows,
          results: normalized || CountByCountry[0]
        });
      }).catch(function(err) {
        res.json({error: err.message});
      });
    });
  } catch (err) {
    res.json({error: err.message});
  }
};


function apiCount(req, res) {
  var queryOptions = {
    country: req.query.country || "", risk: parseInt(req.query.risk) || -1, asn: parseInt(req.query.asn) || -1,
    start: req.query.start || "", end: req.query.end || "",
    limit:checkLimit(req.query.limit) || 20, page: req.query.page || 1
  };
  queryOptions.country = queryOptions.country.toLowerCase();

  logic.getRowCount(queryOptions).then(function(results) {
    return results[0][0].count;
  }).catch(function(err) {
    res.json({error: err.message});
  }).then(function (rows){
    queryOptions.offset = queryOptions.limit*(queryOptions.page-1);
    var totalPages = Math.ceil(rows / queryOptions.limit);

    logic.getTotalCount(queryOptions).then(function(results){
      res.json({
        total_pages: totalPages,
        results: results[0]
      });
    }).catch(function(err) {
      res.json({error: err.message});
    });
  });
};


function apiRisk(req, res) {
  logic.getRiskAPI(req.query).then(function(results){
    res.json({
      total_pages: results[0].length,
      results: results[0]
    });
  }).catch(function(err) {
    res.json({error: err.message});
  });
};

function apiCountry(req, res) {
  logic.getCountryAPI(req.query).then(function(results){
    res.json({
      total_pages: results[0].length,
      results: results[0]
    });
  }).catch(function(err) {
    res.json({error: err.message});
  });
};

function apiAsn(req, res) {
  logic.getAsnAPI(req.query).then(function(results){
    res.json({
      total_pages: results[0].length,
      results: results[0]
    });
  }).catch(function(err) {
    res.json({error: err.message});
  });
};


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

function checkLimit(limit){
    if (parseInt(limit) > 500){
      return '500';
    }
    return limit;
}
