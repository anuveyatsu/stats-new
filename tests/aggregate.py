from psycopg2.extensions import AsIs
from textwrap import dedent

import psycopg2
import random
import csv
import os

fixtures = {
	'risk': 'tests/fixtures/risk.csv',
	'country': 'tests/fixtures/country.csv',
	'asn':'tests/fixtures/asn.csv',
	'count':'tests/fixtures/count.csv'
}

connection = psycopg2.connect(
	database='testdb',
	user='test_user',
	password='secret',
	host='localhost',
	port=5432
	)

def delete_tables():
	cursor = connection.cursor();
	tablenames = [
		'fact_count', 'agg_risk_country_week',
		'agg_risk_country_month', 'agg_risk_country_quarter',
		'agg_risk_country_year', 'dim_risk', 'dim_country', 
		'dim_asn', 'dim_time'
	]
	for tablename in tablenames:
		cursor.execute('DROP TABLE IF EXISTS %(table)s CASCADE',{'table': AsIs(tablename)})
	connection.commit();


def create_tables():
	cursor = connection.cursor();
	create_time = dedent('''
	CREATE TABLE dim_time(
		date DATE, month INT,
		year INT, quarter INT,
		week INT, week_start DATE,
		week_end DATE
		)''')
	create_count = dedent('''
	CREATE TABLE fact_count(
		date DATE, risk INT,
		country VARCHAR(2),
		asn BIGINT, count BIGINT,
		count_amplified FLOAT
		)''')
	create_cube = dedent('''
	CREATE TABLE agg_risk_country_{time}(
		date DATE, risk INT,
		country VARCHAR(2),
		count BIGINT,
		count_amplified FLOAT
		)''')
	create_risks = dedent('''
	CREATE TABLE dim_risk(
		id DOUBLE PRECISION,
		slug TEXT, title TEXT,
		amplification_factor DOUBLE PRECISION,
		description TEXT
		)''')
	create_country = dedent('''
	CREATE TABLE dim_country(
		id TEXT, name TEXT, slug TEXT,
		region TEXT, continent TEXT
		)''')
	create_asn = dedent('''
	CREATE TABLE dim_asn(
		number DOUBLE PRECISION,
		title TEXT, country TEXT
	)
	''')
	cursor.execute(create_time)
	cursor.execute(create_risks)
	cursor.execute(create_country)
	cursor.execute(create_asn)
	cursor.execute(create_count)
	create_or_update_cubes(cursor, create_cube)
	connection.commit()


def load_data():
	epath = os.path.abspath('tests/fixtures/count.csv')
	rpath = os.path.abspath('tests/fixtures/risk.csv')
	cpath = os.path.abspath('tests/fixtures/country.csv')
	capath = os.path.abspath('tests/fixtures/asn.csv')
	
	eload = "COPY fact_count FROM '%s' DELIMITER ',' CSV HEADER;"%epath
	rload = "COPY dim_risk FROM '%s' DELIMITER ',' CSV HEADER;"%rpath
	cload = "COPY dim_country FROM '%s' DELIMITER ',' CSV HEADER;"%cpath
	caload = "COPY dim_asn FROM '%s' DELIMITER ',' CSV HEADER;"%capath
	
	cursor = connection.cursor()
	cursor.execute(eload)
	cursor.execute(rload)
	cursor.execute(cload)
	cursor.execute(caload)
	connection.commit()


def aggregate_entries():
	cursor = connection.cursor()    
	update_time = dedent('''
	INSERT INTO dim_time
	(SELECT
		date,
		EXTRACT(MONTH FROM date) as month,
		EXTRACT(YEAR FROM date) as year,
		EXTRACT(QUARTER FROM date) as quarter,
		EXTRACT(WEEK FROM date) as week,
		date_trunc('week', date) as week_start,
		(date_trunc('week', date)+'6 days') as week_end
	FROM fact_count GROUP BY date)
	''')
	populate_cube = dedent('''
	INSERT INTO agg_risk_country_{time}
		(SELECT date_trunc('{time}', date) AS date, risk, country, 
		SUM(count) AS count, SUM(count_amplified) FROM fact_count
	GROUP BY CUBE(date, country, risk) ORDER BY date DESC, country)
	''')
	cursor.execute(update_time)
	create_or_update_cubes(cursor, populate_cube)
	connection.commit()


def create_constraints():
	cursor = connection.cursor()
	risk_constraints = 'ALTER TABLE dim_risk ADD PRIMARY KEY (id);'
	country_constraints = 'ALTER TABLE dim_country ADD PRIMARY KEY (id);'
	time_constraints = 'ALTER TABLE dim_time ADD PRIMARY KEY (date)'
	asn_constraints = dedent('''
	ALTER TABLE dim_asn
	ADD PRIMARY KEY (number),
	ADD CONSTRAINT fk_asn_country FOREIGN KEY (country) REFERENCES dim_country(id)
	''')
	count_counstraints = dedent('''
	ALTER TABLE fact_count
	ADD CONSTRAINT fk_count_risk FOREIGN KEY (risk) REFERENCES dim_risk(id),
	ADD CONSTRAINT fk_count_country FOREIGN KEY (country) REFERENCES dim_country(id),
	ADD CONSTRAINT fk_count_asn FOREIGN KEY (asn) REFERENCES dim_asn(number),
	ADD CONSTRAINT fk_count_time FOREIGN KEY (date) REFERENCES dim_time(date);
	''')
	cube_counstraints = dedent('''
	ALTER TABLE agg_risk_country_{time}
	ADD CONSTRAINT fk_cube_risk FOREIGN KEY (risk) REFERENCES dim_risk(id),
	ADD CONSTRAINT fk_cube_country FOREIGN KEY (country) REFERENCES dim_country(id)
	''')
	cursor.execute(risk_constraints)
	cursor.execute(country_constraints)
	cursor.execute(asn_constraints)
	cursor.execute(time_constraints)
	cursor.execute(count_counstraints)
	create_or_update_cubes(cursor, cube_counstraints)
	connection.commit()


def create_or_update_cubes(cursor,cmd):
	time_granularities = [
		'week', 'month', 'quarter', 'year'
	]
	for time in time_granularities:
		cursor.execute(cmd.format(time=time))


if __name__ == '__main__':
	delete_tables()
	create_tables()
	load_data() 
	aggregate_entries()
	create_constraints()
