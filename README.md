CyberGreen stats site prototype.

## Development

To build and view the app:

1. Clone the repo
2. Install dependencies

    ```
    [sudo] npm install
    ```

3. Create a database and set configuration [see below]

4. Run the app. From the base directory:

    ```
    node app.js
    ```

5. Visit the running app in your browser at http://localhost:8000/


## Instructions for creating a local database

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

Create test role and give it superuser privileges

```
CREATE USER test_user WITH PASSWORD 'secret';
ALTER USER test_user WITH SUPERUSER;
```

Create test database

```
CREATE DATABASE testdb;
```
Run aggregation script
```
$ pyton tests/aggregate.py
```
