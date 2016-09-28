import random
import csv
import psycopg2
import os

RISKSFILE = 'tests/fixtures/risks.csv'
COUNTRYFILE = 'tests/fixtures/country.csv'
COUNT = 'tests/fixtures/entries.csv'
COUNTRY_ASN = 'tests/fixtures/country_asn.csv'

fo = open(COUNTRYFILE)
places = [ place['id'] for place in csv.DictReader(fo) ]
fo = open(RISKSFILE)
risks = [risk['risk_id'] for risk in csv.DictReader(fo)]
months = ['2016-04-01','2016-05-01','2016-06-01','2016-07-01','2016-08-01']

def agregate_data():
	result = [[ 'id', 'risk', 'country', 'asn', 'date', 'period_tpe','count']]
	country_asn = [['place', 'asn', 'date']]
	rowid = 0
	for place in places:
		two_digit = random.randrange(10, 100) 
		digit_traker = {}
		while two_digit not in digit_traker:
			two_digit = random.randrange(10, 100)
			digit_traker[two_digit] = place
		for i in range(10):            
			five_digit = random.randrange(10000, 100000)
			asn = int(str(two_digit) + str(five_digit))
			country_asn.append([place, asn, '2016-01-01'])
			for risk in risks:
				for month in months:        
					count = random.randrange(200, 300)
					country = place.upper()
					result.append([rowid, risk, country, asn, month, 'weekly', count])
					rowid += 1
	return result, country_asn

def write_csv(data):
    with open(COUNT, 'w') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(data[0])
    with open(COUNTRY_ASN, 'w') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(data[1])

connection = psycopg2.connect(
	database='testdb',
	user='test_user',
	password='secret',
	host='localhost',
	port=5432
	)

def delete_tables():	
	cursor = connection.cursor();
	tablenames = ['count', 'risks', 'country', 'count_by_country', 'count_by_risk', 'country_asn']
	for tablename in tablenames:
		cursor.execute("select exists(SELECT * FROM information_schema.tables WHERE table_name='%s')"%tablename)	
		if cursor.fetchone()[0]:
			cursor.execute('DROP TABLE %s'%tablename)
		connection.commit();
			
def create_tables():
	cursor = connection.cursor();
	create_entries = """
CREATE TABLE count
(id bigint, risk int, country varchar(2), asn bigint, date date, period_type varchar(8), count int);
"""
	create_risks = """
CREATE TABLE risks
(risk_id int, id varchar(16), title varchar(16), total int, max int, min int, mean int, score real, rank int, place_count int, icon bytea, category varchar(16), description text);
"""
	create_country = """
CREATE TABLE country
(id varchar(2), name varchar(32), slug varchar(32), region varchar(32), continent varchar(16), score real, rank int);
"""
	create_count_by_country = """
CREATE TABLE count_by_country
(risk int, country varchar(2), date date, count bigint, score real, rank int);
"""
	create_count_by_risk = """
CREATE TABLE count_by_risk
(risk int,  date date, count bigint, max bigint);
"""
	create_country_asn = """
CREATE TABLE country_asn
(place varchar(2), asn varchar(16), date varchar(16));
"""
	cursor.execute(create_entries)
	cursor.execute(create_risks)
	cursor.execute(create_country)
	cursor.execute(create_count_by_country)
	cursor.execute(create_count_by_risk)
	cursor.execute(create_country_asn)
	connection.commit();

def load_data():
	epath = os.path.abspath("tests/fixtures/count.csv")
	rpath = os.path.abspath("tests/fixtures/risks.csv")
	cpath = os.path.abspath("tests/fixtures/country.csv")
	capath = os.path.abspath("tests/fixtures/country_asn.csv")
	
	eload = "COPY count FROM '%s' DELIMITER ',' CSV HEADER;"%epath
	rload = "COPY risks FROM '%s' DELIMITER ',' CSV HEADER;"%rpath
	cload = "COPY country FROM '%s' DELIMITER ',' CSV HEADER;"%cpath
	caload = "COPY country_asn FROM '%s' DELIMITER ',' CSV HEADER;"%capath
	
	cursor = connection.cursor()
	cursor.execute(eload)
	cursor.execute(rload)
	cursor.execute(cload)
	cursor.execute(caload)
	connection.commit()
	
def aggregate_entries():
	tablename = 'count_by_country'
	copytable = 'count'
	cursor = connection.cursor()    
	query = """
INSERT INTO %s
(SELECT risk, country, date, SUM(count) AS count, 0, 0
FROM %s GROUP BY date, risk, country)
"""%(tablename, copytable)
	cursor.execute(query)
	connection.commit()

	tablename = 'count_by_risk'
	copytable = 'count_by_country'
	query = """
INSERT INTO %s
(SELECT risk, date, SUM(count), max(count)
FROM %s GROUP BY date, risk)
"""%(tablename, copytable)
	cursor.execute(query)
	connection.commit()

	risktable = 'count_by_risk'
	placetable = 'count_by_country'
	query = """
UPDATE {0}
SET score = (LOG({1}.max) - LOG({0}.count))/(LOG({1}.max))*100
FROM {1}
WHERE {0}.risk = {1}.risk AND {0}.date = {1}.date;
""".format(placetable, risktable)
	cursor.execute(query)
	connection.commit()

if __name__ == '__main__':
	data = agregate_data()
	write_csv(data)
	delete_tables()
	create_tables()
	load_data() 
	aggregate_entries()
