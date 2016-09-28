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

## Setting up a Database

There are two options:

* A local database - this is needed if you are doing local development and testing. See next section.
* The online development database - this is for demo-ing and testing against
  the full dataset. You can connect direct to the live development using your
  .env. You will need to get the connection details from the tech lead.

### Creating a local database

Install postgresql

```
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

Create the user and database

```
# Switch to postgres user
sudo su postgres

# Log in 
psql -d postgres -U postgres

# Create test role and give it superuser privileges

CREATE USER test_user WITH PASSWORD 'secret';
ALTER USER test_user WITH SUPERUSER;

CREATE DATABASE testdb;
```

Run aggregation script

```
$ python tests/aggregate.py
```

