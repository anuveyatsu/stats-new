var data = graphData
var risks = [];
data.forEach(function(risk){
  if (!risks.includes(risk.risk)){
    risks.push(risk.risk);
  }
});
risks.push('all');

var spec = {
  "parameters": [
    {
        "signal": "Risks", "type": "radio", "value": "all",
        "options": risks
    }
  ],
  "actions": {source: false, editor: false},
  "spec":{
    "width": 1000,
    "height": 400,
    "data": [
      {
        "name": "risks",
        "values": data,
        "format": {"parse": {"count": "number", "time":"date"}},
        "transform": [
            {
                "type": "filter",
                "test": "(Risks === 'all' || datum.risk === Risks)"
            }
        ]
      }
    ],
    "scales": [
      {
        "name": "x",
        "type": "time",
        "range": "width",
        "domain": {"data": "risks", "field": "time"}
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "nice": true,
        "domain": {"data": "risks", "field": "count"}
      },
      {
        "name": "color", 
        "type": "ordinal", 
        "domain": {"data": "risks", "field": "risk"},
        "range": "category10"
      }
    ],
    "axes": [
      {"type": "x", "scale": "x", "tickSizeEnd": 0},
      {"type": "y", "scale": "y"}
    ],
    "marks": [
      {
        "type": "group",
        "from": {
          "data": "risks",
          "transform": [{"type": "facet", "groupby": ["risk"]}]
        },
        "marks": [
          {
            "type": "line",
            "properties": {
              "enter": {
                "x": {"scale": "x", "field": "time"},
                "y": {"scale": "y", "field": "count"},
                "stroke": {"scale": "color", "field": "risk"},
                "strokeWidth": {"value": 2}
              }
            }
          }
        ]
      }
    ]
  }
};
vg.embed('#vis', spec, function(error, result) {});
