# importing libraries
import requests
import json
import datetime
import os.path
import time

# Helper for Request Session handling
from ..helper import helper as helper

# default api-endpoint of Household Server
householdServerURL = "http://household-server-1:3002/sensor-stats"

def upload(householdServerURL, deltaObject):

    # INPUTS
    print('====================')
    print('UPLOAD Inputs:')
    print('Input household server URL:      ',householdServerURL)
    print('Input object:                    ',deltaObject)
    print('====================')

    # TODO: round float to integer because of Household interface
    DATA = {
            "meterDelta"    : int(round(deltaObject['delta'])),
            "produce"       : int(round(deltaObject['production'])),
            "consume"       : int(round(deltaObject['consumption'])),
            "time"          : deltaObject['time']
    }

    HEADER = {'Content-type': 'application/json'}

    print('')
    print('HTTP PUT Request for Household API:')
    print('===================================')
    print('  URL:           h   = {}'.format(householdServerURL))
    print('  DATA:          h_s = {}'.format(DATA))
    print('')

    # sending put request and saving the response as response object
    print('Uploading Data to {} '.format(householdServerURL))
    print('DATA:                ', DATA)

    t0 = time.time()
    try:
        householdServerResponse = helper.requests_retry_session().put(url = householdServerURL, data = json.dumps(DATA), headers = HEADER)
    except requests.exceptions.RequestException as e:
        print("ERROR: While trying to send a PUT Request towards the Household Server: ", e)
        raise SystemExit(e)
    else:
        print('It eventually worked', householdServerResponse.status_code)
    finally:
        t1 = time.time()
        print('Took', t1 - t0, 'seconds')

    # extracting data in json format
    #print('Extracting data')
    #householdServerJSONResponse = householdServerResponse.json()

    # print data
    print('Printing response from household server: ', householdServerResponse)
    return householdServerResponse

if __name__ == "__main__":
    download()
