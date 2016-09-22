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


exports.getPlaceScore = function(sequelize, place){
  
  var where = "1=1"
  if (place) where = "slug='" + place + "'"
  var logic = "SELECT entries_by_place.country as place_id, entries_by_place.risk as risk, sum(entries_by_place.score)/count(entries_by_place.score) as score, sum(count) as count, places.name as name, places.slug as slug FROM entries_by_place JOIN places on (entries_by_place.country = upper(places.id)) WHERE "+where+" GROUP BY place_id, risk, name, slug;"
  
  return sequelize.query(logic);
};	
