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
Log in 
```
psql -d postgres -U postgres
```
Create test role and give superuser privileges
```
CREATE USER test_user WITH PASSWORD 'secret';
ALTER USER test_user WITH SUPERUSER;
```
Create test database
```
CREATE DATABASE testdb;
```
Quit and connect as test user
```
\q
$ psql -h localhost -U test_user testdb  \\ enter the passwer 'secret'
```

Create table and copy data into
```
CREATE TABLE entries(country varchar(40), asn int, month varchar(40), risk varchar(40), count int);
COPY entries(country, asn, month, risk, count)
FROM '/path/to/entries.csv' 
WITH DELIMITER ','
CSV HEADER;
```
Check the contents
```
select * from tablename;
```