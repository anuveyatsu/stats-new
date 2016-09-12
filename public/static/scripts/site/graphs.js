var data = graphData

var risks = [
  {risk: 'spam', color: 'blue'},
  {risk:'opendns', color: 'black'},
  {risk:'openntp', color:'red'},
  {risk: 'openssdp', color: 'green'}
  ];
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
          "domain": {"data": "risks", "field": risk.risk}
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
              "y": {"scale": "y", "field": risk.risk},
              "stroke": {"value": risk.color},
              "strokeWidth": {"value": 2}
            }
          }
        }
      ]
    }
  };
  vg.embed('#vis' + risk.risk, spec, function(error, result) {});
});
