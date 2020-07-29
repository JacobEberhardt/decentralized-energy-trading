# importing libraries
import requests
import json
import datetime
import os.path
import time

# middleware api-endpoint default
middlewareURL = "https://portal.blogpv.net/api/discovergy/readings"

def download(meterID, middlewareURL, interval):

    # current time in epoch
    current_time = datetime.datetime.now()
    current_time_mili = int(current_time.timestamp() * 1000)
    interval_ago = current_time - datetime.timedelta(seconds=interval * 2)
    interval_ago_epoch_ts = int(interval_ago.timestamp() * 1000)
    print('current time: ' + current_time.strftime("%d.%m.%y %H:%M:%S") + ' in Millis since epoch: ', current_time_mili)
    print('interval ago time: ', interval_ago.strftime("%d.%m.%y %H:%M:%S"))
    print('current Millis minus Interval Millis since epoch: ', interval_ago_epoch_ts)

    PARAMS = {
            'meterId'    : meterID,
            'from'       : interval_ago_epoch_ts,
            'resolution' : 'fifteen_minutes'
    }

    print('')
    print('Request for Meter Data:')
    print('=======================')
    print('  URL:          h   = {}'.format(middlewareURL))
    print('  Parameter:    h_s = {}'.format(PARAMS))
    print('')

    # sending get request and saving the response as response object
    print('Requesting Data from {}'.format(middlewareURL))
    middlewareResponse = requests.get(url = middlewareURL, params = PARAMS)

    # extracting data in json format
    print('Extracting data')
    middlewareJSONResponse = middlewareResponse.json()

    # print data
    #print('Printing data in blogpvmiddleware: ', middlewareJSONResponse)
    #t = datetime.datetime.now()
    return middlewareJSONResponse

if __name__ == "__main__":
    download()
