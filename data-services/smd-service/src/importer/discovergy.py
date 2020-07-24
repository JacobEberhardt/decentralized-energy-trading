# importing libraries
import requests
import json
import datetime
import os.path

# api-endpoint
URL = "https://portal.blogpv.net/api/discovergy/readings"

# TODO: defining a params dict for the parameters to be sent to the API
PARAMS = {
        'meterId'    : '9084bf04f4704917a23fd61da1845379',
        'from'       : '1574982000000',
        'resolution' : 'fifteen_minutes',
        'to'         : '1575068400000'
}

# Write output as backup to this folder.
OUT_DIR = 'samples'

#Write output to this folder.
BACKUP_DIR = os.path.join(OUT_DIR, 'backup')

def download(url=URL, params=PARAMS):
    print('')
    print('Request for Meter Data:')
    print('=======================')
    print('  URL:          h   = {}'.format(URL))
    print('  Parameter:    h_s = {}'.format(PARAMS))
    print('')

    # sending get request and saving the response as response object
    print('Requesting Data from {}'.format(URL))
    r1 = requests.get(url = URL, params = PARAMS)

    # extracting data in json format
    print('Extracting data')
    data_from = r1.json()

    # print data
    print('Printing data: ', data_from)
    t = datetime.datetime.now()

if __name__ == "__main__":
    download()
