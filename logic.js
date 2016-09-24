exports.getSingleEntry= function(data, matchWith, matchTo){
  var result = {};
  data.forEach(function(entry) {
    if(entry[matchWith] === matchTo ){
      result = entry;
    }
  });
  return result;
};

exports.getEntriesFromDatabase = function(sequelize, table, options){
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var asnLogic = "1=1";
  var timeLogic = "1=1";

  if (options){
    if (options.place) placeLogic = "country = '" + options.place.toUpperCase() + "'";
    if (options.risk) riskLogic = "risk = '" + options.risk + "'";
    if (options.asn) asnLogic = "asn = '" + options.asn + "'";
    if (options.date) timeLogic = "date = '" + options.date + "'";
  }
  var logic = "SELECT * FROM "+table+" WHERE "+placeLogic+" AND "+riskLogic+" AND "+asnLogic+" AND "+timeLogic;
  return sequelize.query(logic);
};


exports.getPlaceScore = function(sequelize, options){
  
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var asnLogic = "1=1";
  var timeLogic = "1=1";
	
	if (options){
    if (options.place) placeLogic = "slug = '" + options.place + "'";
    if (options.risk) riskLogic = "risks.id = '" + options.risk + "'";
    if (options.asn) asnLogic = "asn = '" + options.asn + "'";
    if (options.date) timeLogic = "date = '" + options.date + "'";
  }
  
  var logic = "SELECT entries_by_place.country as place_id, risks.description as risk_description, risks.id as risk, risks.title as risk_title, ROUND(SUM(entries_by_place.score)/COUNT(entries_by_place.score)) as score, sum(count) as count, places.name as name, places.slug as slug FROM entries_by_place JOIN places on (entries_by_place.country = upper(places.id)) JOIN risks on (entries_by_place.risk=risks.risk_id) WHERE "+placeLogic+" AND "+riskLogic+" AND "+asnLogic+" AND "+timeLogic+" GROUP BY place_id, risks.id, risk_title, name, slug, risk_description;"
  
  return sequelize.query(logic);
};

exports.getCountByCountry = function(sequelize, options){
  
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var timeLogic = "1=1";
	if (options){
    if (options.country) placeLogic = "country = '" + options.country.toUpperCase() + "'";
    if (options.risk) riskLogic = "risks.id = '" + options.risk + "'";
    if (options.date) timeLogic = "date = '" + options.date + "'";
  }
  
  var logic = "SELECT risks.id as risk, LOWER(entries_by_place.country) as country, entries_by_place.date as date, count, ROUND(entries_by_place.score) as score, entries_by_place.rank as rank FROM entries_by_place JOIN risks on (entries_by_place.risk=risks.risk_id) WHERE "+placeLogic+" AND "+riskLogic+" AND "+timeLogic+" ORDER BY date DESC, risk ASC LIMIT(2000);"
  
  return sequelize.query(logic);
};


exports.getAsnCount = function(sequelize, options) {
	
	var placeLogic = "1=1";
	
	if (options){
    if (options.place) placeLogic = "country= '" + options.place + "'";
  }

	var logic = "SELECT asn, risk, max(date) as date, sum(count) as count FROM entries WHERE "+placeLogic+" GROUP BY asn, risk;"
	return sequelize.query(logic)
};
