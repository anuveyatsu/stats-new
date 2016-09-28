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
    heroku local
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

## Deployment to Heroku

Note that you will need to install the [Heroku toolbelt](https://toolbelt.heroku.com/) to carry out the `heroku` commands below.

### Create the application on Heroku

*Skip this step if the application is already deployed*

This is heavily based on [this
tutorial](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction).
```
    # replace {app-name} with the name of your app
    heroku create {app-name}
    git push heroku master
    # now point at our config
    heroku ps:scale web=1
```
## To deploy (already created):

Push to heroku git repo:
```
    git push heroku master
```
*Note*: if didn't do the create you will need to add the heroku remote:
```
    git remote add heroku git@heroku.com:{app-name}.git
```
### Adding collaborators:
```
    heroku sharing:add joe@example.com
```
### Setting the domain name

Do the following:
```
    heroku domains:add {your-domain-name}
```
## Define config vars to connect to RDS database in .env for heroku

Construct URI with following format:

```
DATABASE_URI=dialect+driver://username:password@host:port/database
# example
DATABASE_URI=postgres://cg_user:SecetPassword@cg-example.jdutoe634ksdk.cg-region-1.rds.amazonaws.com:1234/cg_database
```

Now CNAME your domain to {myapp}.herokuapp.com

