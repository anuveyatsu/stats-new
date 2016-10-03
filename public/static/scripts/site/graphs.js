var data = graphData
var risks = graphRisks

risks.forEach(function(risk){
	var template = "Count: {{parent."+String(risk.risk_id)+"}}";
	var spec = {
    "actions": false,
    "spec":{
      "width": 1080,
      "height": 100,
	  "signals": [
        {
          "name": "mouseDate",
          "streams": [
            {
              "type": "mousemove",
              "expr": "eventX()",
              "scale": {"name": "x","invert": true}
            }
          ]
        },
        {
          "name": "mouseCount",
          "streams": [
            {
              "type": "mousemove",
              "expr": "eventY()",
              "scale": {"name": "y","invert": true}
            }
          ]
        }
      ],
      "data": [
        {
          "name": "risks",
          "values": data,
          "format": {"parse": {"month":"date"}}
        },
		{
          "name": "count",
          "source": "risks",
          "transform": [
            {
              "type": "filter",
              "test": "year(datum.month) == year(mouseDate) && month(datum.month) == month(mouseDate) && date(datum.month) == date(mouseDate)"
            }
          ]
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
		  "zero": false,
          "domain": {"data": "risks", "field": String(risk.risk_id)}
        }
      ],
      "axes": [
        {"type": "x", "scale": "x", "ticks": 15, "grid": true},
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
          "type": "group",
          "from": {"data": "count"},
          "properties": {
            "update": {
              "x": {"scale": "x", "signal": "mouseDate", "offset": 5},
              "y": {"scale": "y", "signal": "mouseCount", "offset": -10},
              "width": {"value": 120},
              "height": {"value": 30},
              "fill": {"value": "#edf1f7"},
              "fillOpacity": {"value": 0.85},
              "stroke": {"value": "#aaa"},
              "strokeWidth": {"value": 0.5}
            }
          },
    
          "marks": [
            {
              "type": "text",
              "properties": {
                "update": {
                  "x": {"value": 6},
                  "y": {"value": 19},
                  "text": {"template": template},
                  "fill": {"value": "black"},
                  "align": {"value": "left"}
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
