var data = graphData;
var risks = graphRisks;

risks.forEach(function(risk){
  var test = "datum['"+String(risk.risk_id)+"'] >= 0";
  var spec = {
    "actions": false,
    "spec":{
      "width": 1080,
      "height": 100,
      "signals": [
        {
          "name": "tooltip",
          "init": {},
          "streams": [
            {"type": "symbol:mouseover", "expr": "datum"},
            {"type": "symbol:mouseout", "expr": "{}"}
          ]
        }
      ],
      "data": [
      {
        "name": "risks",
        "values": data,
        "format": {"parse": {"month":"date"}},
        "transform": [
          {"type": "filter", "test": test}
        ]
      }
      ],
      "scales": [
      {
        "name": "x",
        "type": "time",
        "range": "width",
        "nice": "month",
        "domain": {"data": "risks", "field": "month"}
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "nice": true,
        "zero": false,
        "domain": {"data": "risks", "field": String(risk.risk_id)}
      }
      ],
      "axes": [
        {"type": "x", "scale": "x", "ticks": 12, "grid": true},
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
        },
        {
          "type": "symbol",
          "from": {"data": "risks"},
          "properties": {
            "enter": {
              "x": {"scale": "x", "field": "month"},
              "y": {"scale": "y", "field": String(risk.risk_id)},
              "strokeWidth": {"value": 2}
            },
            "update": {
              "fill": {"value": "green"},
              "size": {"value": "80"}
            },
            "hover": {
              "fill": {"value": "red"},
              "size": {"value": "280"}
            }
          }
        },
        {
          "type": "group",
          "properties": {
            "update": {
              "x": {"scale": "x", "signal": "tooltip.month", "offset": 15},
              "y": {"scale": "y", "signal": "tooltip."+String(risk.risk_id), "offset": -10},
              "width": {"value": 120},
              "height": {"value": 30},
              "fill": {"value": "#edf1f7"},
              "fillOpacity": [
                {
                  "test": "!tooltip._id",
                  "value": 0
                },
                  {"value": 0.8}
                ],
              "stroke": {"value": "#aaa"},
              "strokeWidth": [
                {
                  "test": "!tooltip._id",
                  "value": 0
                },
                {"value": 1}
              ]
            }
          },
          "marks": [
            {
              "type": "text",
              "properties": {
                "enter": {
                  "align": {"value": "left"},
                  "fill": {"value": "#333"}
                },
                "update": {
                  "x": {"value": 6},
                  "y": {"value": 13},
                  "text": {"template": "Date: {{tooltip.month | time: '%Y %b %d'}}"},
                  "fillOpacity": [
                    {
                      "test": "!tooltip._id",
                      "value": 0
                    },
                    {"value": 1}
                  ]
                }
              }
            },
            {
              "type": "text",
              "properties": {
                "enter": {
                  "align": {"value": "left"},
                  "fill": {"value": "#333"}
                },
                "update": {
                  "x": {"value": 6},
                  "y": {"value": 27},
                  "text": {"signal": "tooltip."+String(risk.risk_id)},
                  "fillOpacity": [
                    { "test": "!tooltip._id",
                      "value": 0
                    },
                    {"value": 1}
                  ]
                }
              }
            }
          ]
        }  
      ]
    }
  };
  vg.embed('#vis' + risk.id, spec, function(error, result) {});
});
