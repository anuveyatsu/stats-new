var Sequelize = require('sequelize');
var config = require('./config');

if (process.env.DATABASE_URI) {
  // Use DATABASE_URL if it exists, for Heroku.
  sequelize = new Sequelize(process.env.DATABASE_URI, {});
} else {
  // Fallback to normal config, for local development and test environments.
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db);
}
exports.getSingleEntry= function(data, matchWith, matchTo){
  var result = {};
  data.forEach(function(entry) {
    if(entry[matchWith] === matchTo ){
      result = entry;
    }
  });
  return result;
};
// reference data
exports.getRisks= function(){
  return sequelize.query("SELECT * FROM risk");
};
exports.getCountries= function(){
  return sequelize.query("SELECT * FROM country");
};

exports.getEntriesFromDatabase = function(table, options){
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var numRiskLogic = "1=1";
  var asnLogic = "1=1";
  var timeLogic = "1=1";
  var riskIdLogic = "1=1";
	var order = '';
  var limit = "";
  var logic;
  
  if (options){
    if (options.place) placeLogic = "country = '" + options.place.toUpperCase() + "'";
    if (options.id) riskLogic = "id = '" + options.id.toLowerCase() + "'";
    if (options.risk) riskIdLogic = "risk = '" + options.risk + "'";
    if (options.risk_id) numRiskLogic = "risk_id = '" + options.risk_id + "'";
    if (options.asn) asnLogic = "asn = '" + options.asn + "'";
    if (options.date) timeLogic = "date = '" + options.date + "'";
    if (options.limit) limit = " limit '" + options.limit+ "'";
  }
  logic = "SELECT * FROM "+table+" WHERE "+placeLogic+" AND "+riskLogic+" AND "+asnLogic+" AND "+timeLogic+" AND "+numRiskLogic+" AND "+riskIdLogic + order + limit;
  return sequelize.query(logic);
};

exports.getEntriesByASN= function(asn){
  logic = "SELECT risk, country, asn, to_char(date, 'YYYY-MM-DD') as date, count FROM count WHERE asn = $asn ORDER BY date ASC";
  return sequelize.query(logic, { bind: { asn: asn }});
};

exports.getScores = function(options){
  var logic;
  if (options){
    if (options.country && options.risk){
      logic = "SELECT TO_CHAR(count_by_country.date, 'YYYY-MM-DD') as date, count_by_country.country as country_id, risk.description as risk_description, risk.id as risk, risk.title as risk_title, ROUND(count_by_country.score) as score, count, country.name as name, country.slug as slug FROM count_by_country JOIN country on (count_by_country.country = upper(country.id)) JOIN risk on (count_by_country.risk=risk.risk_id)  WHERE date=(select max(date) FROM count_by_country) AND slug = $slug AND risk.id = $risk GROUP BY country_id, risk.id, risk_title, name, slug, risk_description, count_by_country.score, date, count;";
      return sequelize.query(logic, { bind: { slug: options.country, risk: options.risk }});
    } else if (options.country) {
      logic = "SELECT TO_CHAR(count_by_country.date, 'YYYY-MM-DD') as date, count_by_country.country as country_id, risk.description as risk_description, risk.id as risk, risk.title as risk_title, ROUND(count_by_country.score) as score, count, country.name as name, country.slug as slug FROM count_by_country JOIN country on (count_by_country.country = upper(country.id)) JOIN risk on (count_by_country.risk=risk.risk_id)  WHERE date=(select max(date) FROM count_by_country) AND slug = $slug GROUP BY country_id, risk.id, risk_title, name, slug, risk_description, count_by_country.score, date, count;";
      
      return sequelize.query(logic, { bind: { slug: options.country}});
    } else if (options.risk) {
      logic = "SELECT TO_CHAR(count_by_country.date, 'YYYY-MM-DD') as date, count_by_country.country as country_id, risk.description as risk_description, risk.id as risk, risk.title as risk_title, ROUND(count_by_country.score) as score, count, country.name as name, country.slug as slug FROM count_by_country JOIN country on (count_by_country.country = upper(country.id)) JOIN risk on (count_by_country.risk=risk.risk_id)  WHERE date=(select max(date) FROM count_by_country) AND risk.id = $risk GROUP BY country_id, risk.id, risk_title, name, slug, risk_description, count_by_country.score, date, count;";
      return sequelize.query(logic, { bind: { risk: options.risk }});
    }
  } else {
    logic = "SELECT TO_CHAR(count_by_country.date, 'YYYY-MM-DD') as date, count_by_country.country as country_id, risk.description as risk_description, risk.id as risk, risk.title as risk_title, ROUND(count_by_country.score) as score, count, country.name as name, country.slug as slug FROM count_by_country JOIN country on (count_by_country.country = upper(country.id)) JOIN risk on (count_by_country.risk=risk.risk_id)  WHERE date=(select max(date) FROM count_by_country) GROUP BY country_id, risk.id, risk_title, name, slug, risk_description, count_by_country.score, date, count;";
    return sequelize.query(logic);
  } 
};

exports.getRiskCount = function(){
  var logic = "SELECT id, title, description, date, count FROM risk LEFT JOIN (SELECT * FROM count_by_risk WHERE date=(select max(date) FROM count_by_risk)) AS foo ON risk_id=risk GROUP BY id, title, date, count, description;";
  return sequelize.query(logic);
};

exports.getCountByCountry = function(options){
  
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var timeLogic = "1=1";
  var limit = "Limit 2000";
  
	if (options){
    if (options.country) placeLogic = "country = '" + options.country.toUpperCase() + "'";
    if (options.risk) riskLogic = "risk.id = '" + options.risk + "'";
    if (options.date) timeLogic = "date = '" + options.date + "'";
    if (options.limit) limit = "limit '" + options.limit+ "'";
  }
  
  var logic = "SELECT risk.id as risk, LOWER(count_by_country.country) as country, to_char(count_by_country.date,'YYYY-MM-DD') as date, count, ROUND(count_by_country.score) as score, count_by_country.rank as rank FROM count_by_country JOIN risk on (count_by_country.risk=risk.risk_id) WHERE "+placeLogic+" AND "+riskLogic+" AND "+timeLogic+" ORDER BY date DESC, risk ASC "+limit+";";

  return sequelize.query(logic);
};

exports.getAsnCount = function(country) {
  var logic = "SELECT asn, risk, max(date) as date, sum(count) as count FROM count WHERE date=(select max(date) FROM count) AND country = $country GROUP BY asn, risk;";
	return sequelize.query(logic, { bind: { country: country }});
};

exports.getTotalCount = function(options) {
	
	var placeLogic = "1=1";
	var asnLogic = "1=1";
	var date = "1=1";
	var startDate = "1=1";
	var endDate = "1=1";
  var limit = " limit 2000";
  var order = " DESC";
	
	if (options){
    if (options.country) placeLogic = "country= '" + options.country.toUpperCase() + "'";
    if (options.asn) asnLogic = "asn= '" + options.asn + "'";
    if (options.date) date = "date = '" + options.date + "'";
    if (options.start) startDate = "date > '" + options.start + "'";
    if (options.end) endDate = "date < '" + options.end + "'";
    if (options.limit) limit = " limit " + options.limit+ "";
    if (options.order) order = " " + options.order;
  }

	var logic = "SELECT country, risk, asn, to_char as date, period_type, count FROM (SELECT country, risk, asn, TO_CHAR(date,'YYYY-MM-DD'), period_type, sum(count) as count FROM count WHERE "+placeLogic+" AND "+asnLogic+" AND "+startDate+" AND "+endDate+" AND "+date+" GROUP BY country, risk, asn, date, period_type ORDER BY date "+order+") AS foo"+limit+";";
	return sequelize.query(logic);
};

exports.getAsnTotal = function() {
  var logic = "SELECT name, slug, country, count(asn) FROM country_asn JOIN country ON country_asn.country=country.id GROUP BY name, slug, country ORDER BY name ASC;";
  return sequelize.query(logic);
};
