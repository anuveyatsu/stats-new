var Sequelize = require('sequelize');
var dbConfig = require('./dbconfig');

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if it exists, for Heroku.
  sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);
} else {
  // Fallback to normal config, for local development and test environments.
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig);
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

exports.getMultipleEntries = function(data, place, risk, asn){
  var result = [];
  var placeKey;
  var riskKey;
  var asnKey;
  
  if (place) placeKey = 'country';
  if (risk) riskKey = 'risk';
  if (asn) asnKey = 'asn';
  
  data.forEach(function(entry) {
    if(entry[placeKey] === place && entry[riskKey] === risk && entry[asnKey] === asn){
      result.push(entry);
    }
  });
  return result;
};
  