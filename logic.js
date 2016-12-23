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
  return sequelize.query("SELECT * FROM dim_risk");
};
exports.getCountries= function(){
  return sequelize.query("SELECT * FROM dim_country");
};

exports.getEntriesByASN= function(asn){
  logic = "SELECT risk, country, asn, to_char(date, 'YYYY-MM-DD') as date, count FROM fact_count WHERE asn = $asn ORDER BY date ASC";
  return sequelize.query(logic, { bind: { asn: asn }});
};

// gets total af count for each date. This is temporary HACK! needs to be chnaged)
exports.getTotalCountsByDate = function() {
  var logic = "SELECT TO_CHAR(date, 'YYYY-MM-DD') as month, ROUND(count_amplified) as count_amplified FROM agg_risk_country_week WHERE date IS NOT NULL AND risk IS NULL and COUNTRY IS NULL ORDER BY date DESC";
  return sequelize.query(logic);
};

exports.getAggregatedEntries = function(options){
  var slug = '',
      risk = '',
      date = '';
  if (options) {
    if (options.country) slug = options.country;
    if (options.risk) risk = options.risk;
    if (options.date) date = options.date;
  }

  var logic = "SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, risk, dim_risk.slug as risk_slug, dim_risk.title as risk_title, dim_risk.description as risk_description, country as country_id,  dim_country.name as name, dim_country.slug as slug, count, count_amplified FROM agg_risk_country_week JOIN dim_country ON (country = dim_country.id) JOIN dim_risk on (risk=dim_risk.id) WHERE ($date = '' OR date = DATE($date)) AND ($slug = '' OR dim_country.slug = $slug) AND ($risk = '' OR dim_risk.slug = $risk) ORDER BY date ASC";
  return sequelize.query(logic, { bind: { slug: slug, risk: risk, date: date}}).catch(function(err){
    return err;
  });
};

exports.getRiskCount = function(week){
  var logic = "SELECT slug, title, description, TO_CHAR(date, 'YYYY-MM-DD') as date, count FROM dim_risk LEFT JOIN (SELECT risk, count, date FROM agg_risk_country_week WHERE date::text = $date AND country IS NULL) AS foo ON dim_risk.id=risk;";
  return sequelize.query(logic, { bind: {date: week.date}});
};

exports.getRiskAPI = function(options){
  var id = '';
  var risk_id = '';
  var title = ''; 
  if (options.id) id = options.id;
  if (options.slug) risk_id = options.slug;
  if (options.title) title = options.title.toLowerCase();
  var logic = "SELECT * FROM dim_risk WHERE ($id = '' OR id::text = $id) AND ($risk_id = '' OR slug = $risk_id) AND ($title = '' OR LOWER(title) = $title) ORDER BY id ASC";
  return sequelize.query(logic, { bind: { id: id, risk_id: risk_id, title: title}});
};

exports.getCountryAPI = function(options){
  var id = '';
  var name = '';
  var slug = '';
  var region = '';
  var continent = '';
  if (options.id) id = options.id;
  if (options.name) name = options.name.toLowerCase();
  if (options.slug) slug = options.slug.toLowerCase();
  if (options.region) region = options.region.toLowerCase();
  if (options.continent) continent = options.continent.toLowerCase();
  var logic = "SELECT * FROM dim_country WHERE ($id = '' OR id = UPPER($id)) AND ($name = '' OR lower(name) = $name) AND ($slug = '' OR lower(slug) = $slug) AND ($region = '' OR lower(region) = $region) AND ($continent = '' OR lower(continent) = $continent) ORDER BY id ASC";
  return sequelize.query(logic, { bind: { id: id, name: name, slug: slug, region: region, continent: continent}});
};

exports.getAsnAPI = function(options){
  var country = '';
  var asn = '';
  var name = ''; 
  if (options.country) country = options.country;
  if (options.asn) asn = options.asn;
  if (options.name) name = options.name;
  var logic = "SELECT country, number, title FROM dim_asn WHERE ($country = '' OR country = UPPER($country)) AND ($asn = '' OR number::text = $asn) AND ($name = '' OR title = $name) ORDER BY country ASC";
  return sequelize.query(logic, { bind: { country: country, asn: asn, name: name}});
};

exports.getCountByCountry = function(options){
  if (options.limit.toLowerCase() === 'none'){
    // for map
    logic = "SELECT slug as risk, country, to_char(date,'YYYY-MM-DD') as date, count FROM agg_risk_country_week JOIN dim_risk on (agg_risk_country_week.risk=dim_risk.id) WHERE ($country = '' OR lower(country) = $country) AND ($risk = '' OR slug = $risk) AND ($start = '' OR date >= to_date($start,'YYYY-MM-DD')) AND ($end = '' OR date <= to_date($end,'YYYY-MM-DD')) AND date IS NOT NULL ORDER BY date DESC, risk ASC;";
    return sequelize.query(logic, { bind: options});
  }else {
    logic = "SELECT slug as risk, country, to_char(date,'YYYY-MM-DD') as date, count FROM agg_risk_country_week JOIN dim_risk on (agg_risk_country_week.risk=dim_risk.id) WHERE ($country = '' OR lower(country) = $country) AND ($risk = '' OR dim_risk.slug = $risk) AND ($start = '' OR date >= to_date($start,'YYYY-MM-DD')) AND ($end = '' OR date <= to_date($end,'YYYY-MM-DD')) AND date IS NOT NULL ORDER BY date DESC, country ASC LIMIT $limit OFFSET $offset;";
    return sequelize.query(logic, { bind: options});
  }
};

exports.getRowCountBYCountry = function(options) {  
  var logic = "SELECT COUNT(*) FROM agg_risk_country_week JOIN dim_risk on (agg_risk_country_week.risk=dim_risk.id) WHERE ($country = '' OR lower(country) = $country) AND ($risk = '' OR dim_risk.id::text = $risk) AND ($start = '' OR date >= to_date($start,'YYYY-MM-DD')) AND ($end = '' OR date <= to_date($end,'YYYY-MM-DD'));";
  return sequelize.query(logic, { bind: options});
};

exports.getAsnCount = function(country, date) {
  var logic = "SELECT asn, risk, SUM(count) as count, SUM(count_amplified) as count_amplified FROM fact_count WHERE date_trunc('week', date) = $date AND country = $country GROUP BY asn, risk;";
	return sequelize.query(logic, { bind: { country: country, date: date }});
};

exports.getTotalCount = function(options) {
	var logic = "SELECT country, risk, asn, to_char as date, count FROM (SELECT country, risk, asn, TO_CHAR(date,'YYYY-MM-DD'), sum(count) as count FROM fact_count WHERE ($risk = '' OR risk::text = $risk) AND ($country = '' OR lower(country) = $country) AND ($asn = '' OR asn::text = $asn) AND ($start = '' OR date >= to_date($start,'YYYY-MM-DD')) AND ($end = '' OR date <= to_date($end,'YYYY-MM-DD')) GROUP BY country, risk, asn, date ORDER BY date DESC, country ASC) AS foo LIMIT $limit OFFSET $offset;";
	return sequelize.query(logic, { bind: options});
};

exports.getRowCount= function(options) {
  var logic = "SELECT COUNT(*) FROM fact_count WHERE ($risk = '' OR risk::text = $risk) AND ($country = '' OR lower(country) = $country) AND ($asn = '' OR asn::text = $asn) AND ($start = '' OR date >= to_date($start,'YYYY-MM-DD')) AND ($end = '' OR date <= to_date($end,'YYYY-MM-DD'));";
  return sequelize.query(logic, { bind: options});
};

exports.getAsnTotal = function() {
  var logic = "SELECT name, slug, country, count(*) FROM dim_asn JOIN dim_country ON dim_asn.country=dim_country.id GROUP BY name, slug, country ORDER BY name ASC;";
  return sequelize.query(logic);
};

exports.getDates = function() {
  var logic = "SELECT TO_CHAR(date,'YYYY-MM-DD') as date FROM agg_risk_country_week WHERE date!=(select max(date) FROM agg_risk_country_week) GROUP BY date ORDER BY date DESC LIMIT 3;";
  return sequelize.query(logic);
};

exports.getCountsForCountry = function(entries) {
  var country_options = [];
  entries.forEach(function(result){
    if (country_options[result.country_id]){
      country_options[result.country_id][result.risk] = {
        count: result.count,
        af_count: Math.round(result.count_amplified)
      };
      country_options[result.country_id][0].count += parseInt(result.count);
      country_options[result.country_id][0].af_count += Math.round(result.count_amplified);
      country_options[result.country_id].slug = result.slug;
      country_options[result.country_id].name = result.name;
    }else{
      country_options[result.country_id] = {};
      country_options[result.country_id][result.risk] = {
        count: result.count,
        af_count: Math.round(result.count_amplified)
        };
      country_options[result.country_id][0] = {
        count: parseInt(result.count),
        af_count: Math.round(result.count_amplified)
      };
      country_options[result.country_id].slug = result.slug;
      country_options[result.country_id].name = result.name;
    }
  });
  var result = [];
  for (var country in country_options){
    if (Object.keys(country_options[country]).length > 3) {
      result.push(country_options[country]);
    }
  }
  return result;
};