var fs = require('fs');
var Papa = require('babyparse'); 

var riskCsv = fs.readFileSync(__dirname + '/data/risks.csv', 'utf8');
var placeCsv = fs.readFileSync(__dirname + '/data/places.csv', 'utf8');
var entryCsv = fs.readFileSync(__dirname + '/data/entries.csv', 'utf8');
var summaryCsv = fs.readFileSync(__dirname + '/data/summary.csv', 'utf8');
var asnCsv = fs.readFileSync(__dirname + '/data/asn.csv', 'utf8');
// transfoms csv to json
var risks = Papa.parse(riskCsv, {header: true}).data;
var places = Papa.parse(placeCsv, {header: true}).data;
var entries = Papa.parse(entryCsv, {header: true}).data;
var asn = Papa.parse(asnCsv, {header: true}).data;
var summary = Papa.parse(summaryCsv, {header: true}).data;
var geoJson = require('./data/geo.json');

var config = {
	"LOAD_CONTENT_CACHE": false,
	"AUTORELOAD": true,
	"IGNORE_CACHE": true,
	"AUTHOR": "CyberGreen",
	"SITENAME": "CyberGreen Statistics",
	"DEFAULT_LANG": "en",
	"PATH": "content",
	"STATIC_PATHS": ["extra/CNAME", "data"],
	"EXTRA_PATH_METADATA": {"extra/CNAME": {"path": "CNAME"}},
	"OUTPUT_PATH": "output",
	"TIMEZONE": "UTC",
	"FEED_ALL_ATOM": null,
	"CATEGORY_FEED_ATOM": null,
	"TRANSLATION_FEED_ATOM": null,
	"LINKS": [["", ""]],
	"SOCIAL": [["", ""]],
	"DEFAULT_PAGINATION": false,
	"PAGE_URL": "{slug}/",
	"PAGE_SAVE_AS": "{slug}/index.html",
	"AUTHOR_SAVE_AS": false,
	"AUTHORS_SAVE_AS": false,
	"TAG_SAVE_AS": false,
	"TAGS_SAVE_AS": false,
	"ARCHIVES_SAVE_AS": false,
	"THEME": null,
	"THEME_STATIC_DIR": "static",
	"THEME_STATIC_PATH": null,
	"DISPLAY_DATE_FORMAT": "%Y-%m-%d",
	"DISPLAY_TIME_FORMAT": "%H:%M:%S",
	"DISPLAY_DATETIME_FORMAT": "Y-%m-%dT%H:%M:%S",
	"TIMESTAMP": null,
	"SUMMARY_MAX_LENGTH": 25,
	"JINJA_EXTENSIONS": [
		"jinja2.ext.do",
		"jinja2.ext.with_",
		"jinja2.ext.loopcontrols"
	],
	"JINJA_FILTERS": null,
	"PLUGIN_PATHS": null,
	"PLUGINS": [
		"datastore",
		"datastore_api",
		"datastore_assets",
		"pelican_alias"
	],
	"DATASTORE": {
		"location": null,
		"formats": [".csv"],
		"intrafield_delimiter": "~*",
		"true_strings": ["TRUE", "True", "true"],
		"false_strings": ["FALSE", "False", "false"],
		"none_strings": ["NULL", "Null", "null", "NONE", "None", "none",
						 "NIL", "Nil", "nil", "-", "NaN", "N/A", "n/a", ""],
		"api": { 
			"base": "api", 
			"formats": ["json", "csv"], 
			"filters": {
				"entries": ["year"],
				"datasets": ["category"]
			},
			"exclude": []
		},
		"assets": {
			"location": "downloads"
		}
	},
	"CGR": {
		"scheme": "",
		"domain": "",
		"logo": "/static/images/cybergreen-logo-beta.png",
		"logosquare": "/static/images/cybergreen-logo-square.png",
		"survey": {
		},
		"sponsor": {
		  "name": "Cybergreen",
		  "domain": "https://www.cybergreen.net/"
		},
		"analytics": {
		  "google": ""
		},
		"years": ["2016","2015"],
		"current_year": "2016",
		"previous_year": "2015",
		"na": "n/a", 
		"twitter": "",
		"author": {
			"name": "AUTHOR"
		}
	},
	"SITEURL": "",
	"SITELOGO": "/static/images/cybergreen-logo-beta.png",
	"scope": {
        "risks": risks,
        "places": places,
        "entries": entries,
		"geo": geoJson,
		"summary": summary
    }
}

module.exports = config;