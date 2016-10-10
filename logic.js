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

// reference data
exports.getRisks= function(){
  return sequelize.query("SELECT * FROM risk");
};
exports.getCountries= function(){
  return sequelize.query("SELECT * FROM country");
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

exports.getRiskAPI = function(options){
  var id = '';
  var risk_id = '';
  var title = ''; 
  if (options.id) id = options.id;
  if (options.risk_id) risk_id = options.risk_id;
  if (options.title) title = options.title.toLowerCase();
  var logic = "SELECT * FROM risk WHERE ($id = '' OR id = $id) AND ($risk_id = '' OR risk_id::text = $risk_id) AND ($title = '' OR lower(title) = $title) ORDER BY risk_id ASC";
  return sequelize.query(logic, { bind: { id: id, risk_id: risk_id, title: title}});
};

exports.getCountryAPI = function(options){
  var id = '';
  var name = '';
  var slug = '';
  var region = '';
  var continent = '';
  if (options.id) id = options.id.toLowerCase();
  if (options.name) name = options.name.toLowerCase();
  if (options.slug) slug = options.slug.toLowerCase();
  if (options.region) region = options.region.toLowerCase();
  if (options.continent) continent = options.continent.toLowerCase();
  var logic = "SELECT * FROM country WHERE ($id = '' OR lower(id) = $id) AND ($name = '' OR lower(name) = $name) AND ($slug = '' OR lower(slug) = $slug) AND ($region = '' OR lower(region) = $region) AND ($continent = '' OR lower(continent) = $continent) ORDER BY id ASC";
  return sequelize.query(logic, { bind: { id: id, name: name, slug: slug, region: region, continent: continent}});
};

exports.getAsnAPI = function(options){
  var country = '';
  var asn = '';
  var date = ''; 
  if (options.country) country = options.country.toLowerCase();
  if (options.asn) asn = options.asn;
  if (options.date) date = options.date;
  var logic = "SELECT country, asn, to_char(time,'YYYY-MM-DD') as date FROM country_asn WHERE ($country = '' OR lower(country) = $country) AND ($asn = '' OR asn::text = $asn) AND ($date = '' OR time::text = $date) ORDER BY country ASC";
  return sequelize.query(logic, { bind: { country: country, asn: asn, date: date}});
};

exports.getCountByCountry = function(options){
  var country = '';
  var risk = '';
  var date = '';
  var limit = "2000";
	if (options){
    if (options.country) country = options.country.toUpperCase();
    if (options.risk) risk = options.risk ;
    if (options.date) date = options.date ;
    if (options.limit) limit = options.limit;
  }
  var logic = "SELECT risk.id as risk, LOWER(count_by_country.country) as country, to_char(count_by_country.date,'YYYY-MM-DD') as date, count, ROUND(count_by_country.score) as score, count_by_country.rank as rank FROM count_by_country JOIN risk on (count_by_country.risk=risk.risk_id) WHERE ($country = '' OR country = $country) AND ($risk = '' OR risk.id = $risk) AND ($time = '' OR date::text = $time) ORDER BY date DESC, risk ASC limit $limit;";
  return sequelize.query(logic, { bind: { country: country, risk: risk, time: date, limit: limit}});
};

exports.getAsnCount = function(country) {
  var logic = "SELECT asn, risk, max(date) as date, sum(count) as count FROM count WHERE date=(select max(date) FROM count) AND country = $country GROUP BY asn, risk;";
	return sequelize.query(logic, { bind: { country: country }});
};

exports.getTotalCount = function(options) {
	
	var placeLogic = "";
	var asnLogic = "";
	var date = "";
	var startDate = "";
	var endDate = "";
  var limit = " 2000";
  
	if (options){
    if (options.country) placeLogic =options.country.toLowerCase();
    if (options.asn) asnLogic = options.asn;
    if (options.date) date = options.date;
    if (options.start) startDate = options.start;
    if (options.end) endDate = options.end;
    if (options.limit) limit = options.limit;
  }

	var logic = "SELECT country, risk, asn, to_char as date, period_type, count FROM (SELECT country, risk, asn, TO_CHAR(date,'YYYY-MM-DD'), period_type, sum(count) as count FROM count WHERE ($country = '' OR lower(country) = $country) AND ($asn = '' OR asn::text = $asn) AND ($date = '' OR date::text = $date) AND ($start = '' OR date::text > $start) AND ($end = '' OR date::text < $end) GROUP BY country, risk, asn, date, period_type ORDER BY date DESC) AS foo limit $limit;";
	return sequelize.query(logic, { bind: { country: placeLogic, asn: asnLogic, date: date, start: startDate, end: endDate, limit: limit}});
};

exports.getAsnTotal = function() {
  var logic = "SELECT name, slug, country, count(asn) FROM country_asn JOIN country ON country_asn.country=country.id GROUP BY name, slug, country ORDER BY name ASC;";
  return sequelize.query(logic);
};
