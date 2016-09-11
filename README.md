CyberGreen stats site prototype.

## Development

To build and view the app:

1. Clone the repo
2. Install dependencies

    ```
    [sudo] npm install
    ```

3. Create a database and set configuration TODO

4. Run the app. From the base directory:

    ```
    node app.js
    ```

5. Visit the running app in your browser at http://localhost:8000/


## Load entries to local database

Install postgresql

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
select count(*) from tablename;
```

