var fs = require('fs');
var Papa = require('babyparse'); 

var riskCsv = fs.readFileSync(__dirname + '/data/risks.csv', 'utf8');
var placeCsv = fs.readFileSync(__dirname + '/data/places.csv', 'utf8');
var entryCsv = fs.readFileSync(__dirname + '/data/entries.csv', 'utf8');
var summaryCsv = fs.readFileSync(__dirname + '/data/summary.csv', 'utf8');
// transfoms csv to json
var risks = Papa.parse(riskCsv, {header: true}).data;
var places = Papa.parse(placeCsv, {header: true}).data;
var entries = Papa.parse(entryCsv, {header: true}).data;
var summary = Papa.parse(summaryCsv, {header: true}).data;
var geoJson = require('./data/geo.json');

var config = {
	AUTHOR: "CyberGreen",
	SITENAME: "CyberGreen Statistics",
	CGR: {
		scheme: "",
		domain: "",
		logo: "/static/images/cybergreen-logo-beta.png",
		logosquare: "/static/images/cybergreen-logo-square.png",
		survey: {
		},
		sponsor: {
		  name: "Cybergreen",
		  domain: "https://www.cybergreen.net/"
		},
		analytics: {
		  google: ""
		},
		years: ["2016","2015"],
		current_year: "2016",
		previous_year: "2015",
		na: "n/a", 
		twitter: "",
		author: {
			"name": "AUTHOR"
		}
	},
	SITEURL: "",
	SITELOGO: "/static/images/cybergreen-logo-beta.png",
	scope: {
        risks: risks,
        places: places,
        entries: entries,
		geo: geoJson,
		summary: summary
    }
};

module.exports = config;
