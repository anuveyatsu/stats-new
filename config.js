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
		years: ["2016-08-15","2016-08-08"],
		current_year: "2016-08-15",
		previous_year: "2016-08-08",
		na: "n/a", 
		twitter: "",
		author: {
			"name": "AUTHOR"
		}
	},
	SOURCE_CODE: "https://github.com/cybergreen-net/stats-new",
	SITELOGO: "/static/images/cybergreen-logo-2.png",
	data: {
			test: {"risk":"opendns","place":"ad","year":"2016","count":"30","score":"74.23","rank":"24"}
    },
    db: {
		database: 'testdb',
		username: 'test_user',
		password: 'secret',
		host: 'localhost',
		dialect: 'postgres',
		logging: false
	},
	updates: {}
};

module.exports = config;
