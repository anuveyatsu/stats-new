var data = graphData
var risks = graphRisks

risks.forEach(function(risk){
	var spec = {
    "actions": false,
    "spec":{
      "width": 1080,
      "height": 100,
      "data": [
        {
          "name": "risks",
          "values": data,
          "format": {"parse": {"month":"date"}}
        }
      ],
      "scales": [
        {
          "name": "x",
          "type": "time",
          "range": "width",
          "domain": {"data": "risks", "field": "month"}
        },
        {
          "name": "y",
          "type": "linear",
          "range": "height",
          "nice": true,
          "domain": {"data": "risks", "field": String(risk.risk_id)}
        }
      ],
      "axes": [
        {"type": "x", "scale": "x", "ticks": 5, "grid": true},
        {"type": "y", "scale": "y", "ticks": 3,"grid": true}
      ],
      "marks": [
        {
          "type": "line",
          "from": {"data": "risks"},
          "properties": {
            "enter": {
              "x": {"scale": "x", "field": "month"},
              "y": {"scale": "y", "field": String(risk.risk_id)},
              "stroke": {"value": "green"},
              "strokeWidth": {"value": 2}
            }
          }
        }
      ]
    }
  };
  vg.embed('#vis' + risk.id, spec, function(error, result) {});
});
