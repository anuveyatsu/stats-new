var data = treeAsn;
data.forEach(function(risk){
	var spec = {
		"width": 1160,
		"height": 300,
		"padding": 2.5,
		"data": [
		  {
		    "name": "tree",
		    "values": risk,
		    "format": {"type": "treejson"},
		    "transform": [
		      {"type": "treemap", "field": "count"}
		    ]
		  }
		],
		"scales": [
		  {
		    "name": "color",
		    "type": "ordinal",
		    "range": [
        "#e6550d",
        "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476",
        "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc",
        "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"
      	]
		  },
		  {
		    "name": "count",
		    "type": "ordinal",
		    "domain": [0, 1, 2, 3],
		    "range": [80, 11, 0, 0]
		  },
		  {
		    "name": "opacity",
		    "type": "ordinal",
		    "domain": [0, 1],
		    "range": [0.5, 1.0]
		  }
		],
		"marks": [
		  {
		    "type": "rect",
		    "from": {
		      "data": "tree",
		      "transform": [{"type":"filter", "test":"datum.children"}]
		    },
		    "interactive": false,
		    "properties": {
		      "enter": {
		        "x": {"field": "layout_x"},
		        "y": {"field": "layout_y"},
		        "width": {"field": "layout_width"},
		        "height": {"field": "layout_height"},
		        "fill": {"scale": "color", "field": "name"}
		      }
		    }
		  },
		  {
		    "type": "rect",
		    "from": {
		      "data": "tree",
		      "transform": [{"type":"filter", "test":"!datum.children"}]
		    },
		    "properties": {
		      "enter": {
		        "x": {"field": "layout_x"},
		        "y": {"field": "layout_y"},
		        "width": {"field": "layout_width"},
		        "height": {"field": "layout_height"},
		        "stroke": {"value": "#fff"}
		      },
		      "update": {
		        "fill": {"value": "rgba(0,0,0,0)"}
		      },
		      "hover": {
		        "fill": {"value": "red"}
		      }
		    }
		  },
		  {
		    "type": "text",
		    "from": {
		      "data": "tree",
		      "transform": [{"type":"filter", "test":"!datum.children"}]
		    },
		    "interactive": false,
		    "properties": {
		      "enter": {
		        "x": {"field": "layout_x"},
		        "y": {"field": "layout_y"},
		        "dx": {"field": "layout_width", "mult": 0.5},
		        "dy": {"field": "layout_height", "mult": 0.5},
		        "font": {"value": "Helvetica Neue"},
		        "fontSize": {"scale": "count", "field": "depth"},
		        "align": {"value": "center"},
		        "baseline": {"value": "middle"},
		        "fill": {"value": "#000"},
		        "fillOpacity": {"scale": "opacity", "field": "depth"},
		        "text": {"field": "name"}
		      }
		    }
		  },
		  {
		    "type": "text",
		    "from": {
		      "data": "tree",
		      "transform": [{"type":"filter", "test":"datum.children"}]
		    },
		    "interactive": false,
		    "properties": {
		      "enter": {
		        "x": {"field": "layout_x"},
		        "y": {"field": "layout_y"},
		        "dx": {"field": "layout_width", "mult": 0.5},
		        "dy": {"field": "layout_height", "mult": 0.5},
		        "font": {"value": "Helvetica Neue"},
		        "fontSize": {"scale": "count", "field": "depth"},
		        "align": {"value": "center"},
		        "baseline": {"value": "middle"},
		        "fill": {"value": "#000"},
		        "fillOpacity": {"scale": "opacity", "field": "depth"},
		        "text": {"field": "name"}
		      }
		    }
		  }
		]
	}
	vg.embed('#treemap'+risk.name, spec, function(error, result) {});
})
