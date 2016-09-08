CyberGreen stats site prototype.

Build it and view it:

Clone the repo

Install dependencies

```
$ [sudo] npm install
```

Build the site in node:

From the base directory:

```
$ node app.js

```

Visit http://localhost:8000/ form your browser


## Load enitries to local database

Install the postgresql
```
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```
Switch to postgres user
```
sudo su postgres
```
Log in to database
```
psql -d postgres -U postgres
```
Create and connect to database
```
CREATE DATABASE databasename;
\c databasename
```
Create table and copy data into
```
CREATE TABLE tablename(country varchar(40), asn int, month varchar(40), risk varchar(40), count int);
COPY tablename(country, asn, month, risk, count)
FROM '/path/to/entries.csv' 
WITH DELIMITER ','
CSV HEADER;
```
Check the contents
```
select * from tablename
```