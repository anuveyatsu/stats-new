exports.getSingleEntry= function(data, matchWith, matchTo){
  var result = {};
  data.forEach(function(entry) {
    if(entry[matchWith] === matchTo ){
      result = entry;
    }
  });
  return result;
};

exports.getEntriesFromDatabase = function(sequelize, options){
  var placeLogic = "1=1";
  var riskLogic = "1=1";
  var asnLogic = "1=1";
  var timeLogic = "1=1";
  if (options){
    if (options.place) placeLogic = "country = '" + options.place + "'";
    if (options.risk) riskLogic = "risk = '" + options.risk + "'";
    if (options.asn) asnLogic = "asn = '" + options.asn + "'";
    if (options.date) timeLogic = "month = '" + options.date + "'";
  }
  var logic = "SELECT * FROM entries WHERE "+placeLogic+" AND "+riskLogic+" AND "+asnLogic+" AND "+timeLogic;
  return sequelize.query(logic);
};
