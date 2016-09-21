import random
import csv

PLACESFILE = 'fixtures/places.csv'
ENTRIES = 'fixtures/entries.csv'

fo = open(PLACESFILE)
places = [ place for place in csv.DictReader(fo) ]

risks = [1, 2, 3, 4]

months = ['2016-04-01','2016-05-01','2016-06-01','2016-07-01','2016-08-01']

def agregate_data():
    result = [[ 'id', 'risk','country', 'asn', 'date', 'period_tpe','count']]
    rowid = 0
    for place in places:
        two_digit = random.randrange(10, 100) 
        digit_traker = {}
        while two_digit not in digit_traker:
            two_digit = random.randrange(10, 100)
            digit_traker[two_digit] = place['id']
        for i in range(10):            
            five_digit = random.randrange(10000, 100000)
            asn = int(str(two_digit) + str(five_digit))
            for risk in risks:
                for month in months:        
                    count = random.randrange(200, 300)
                    country = place['id'].upper()
                    result.append([rowid, risk, country, asn, month, 'weekly', count])
                    rowid += 1
    return result        

def write_csv(data):
    with open(ENTRIES, 'w') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(data)
   
data = agregate_data()
write_csv(data)
