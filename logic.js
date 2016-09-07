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
  
  if (place) placeKey = 'place';
  if (risk) riskKey = 'risk';
  if (asn) asnKey = 'asn';
  
  data.forEach(function(entry) {
    if(entry[placeKey] === place && entry[riskKey] === risk && entry[asnKey] === asn){
      result.push(entry);
    }
  });
  return result;
};

