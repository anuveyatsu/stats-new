var Sequelize = require('sequelize');
var dbConfig = require('./dbconfig');

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if it exists, for Heroku.
  sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);
} else {
  // Fallback to normal config, for local development and test environments.
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig);
}
