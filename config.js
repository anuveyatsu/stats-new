var fs = require('fs');
var Papa = require('babyparse'); 

var riskCsv = fs.readFileSync(__dirname + '/data/risks.csv', 'utf8');
var placeCsv = fs.readFileSync(__dirname + '/data/places.csv', 'utf8');
var entryCsv = fs.readFileSync(__dirname + '/data/entries.csv', 'utf8');
var summaryCsv = fs.readFileSync(__dirname + '/data/summary.csv', 'utf8');
var asnCsv = fs.readFileSync(__dirname + '/data/asn-entries.csv', 'utf8');
// transfoms csv to json
var risks = Papa.parse(riskCsv, {header: true}).data;
var places = Papa.parse(placeCsv, {header: true}).data;
var entries = Papa.parse(entryCsv, {header: true}).data;
var summary = Papa.parse(summaryCsv, {header: true}).data;
var asn = Papa.parse(asnCsv, {header: true}).data;

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
	SITELOGO: "/static/images/cybergreen-logo-beta.png",
	data: {
    risks: risks,
    places: places,
    entries: entries,
		summary: summary,
		asn: asn,
		test: {"risk":"opendns","place":"ad","year":"2016","count":"30","score":"74.23","rank":"24"}
    },
	updates: {}
};

module.exports = config;
