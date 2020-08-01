# importing libraries
import requests
import json
import datetime
import os.path
import time

from retry import retry
from datetime import timedelta

# middleware api-endpoint default
middlewareURL = "https://portal.blogpv.net/api/discovergy/readings"

# Helper for Request Session handling
from ..helper import helper as helper

@retry(Exception, delay=1*60, tries=-1)
def download(meterIDList, middlewareURL, retrievalday):

    # get retrievalday
    from_date = datetime.datetime.strptime(retrievalday, '%d.%m.%Y')
    from_date_milli = int(from_date.timestamp() * 1000)
    to_date = from_date + timedelta(days=1) -  timedelta(minutes=15)
    to_date_milli = int(to_date.timestamp() * 1000)
    print('from date: ' + from_date.strftime("%d.%m.%y %H:%M:%S") + ' in Millis since epoch: ', from_date_milli)
    print('to date: ' + to_date.strftime("%d.%m.%y %H:%M:%S") + ' in Millis since epoch: ', to_date_milli)
    print('length of meterIDList: ', len(meterIDList))

    # sending get request and saving the response as response object
    print('Requesting Data from {}'.format(middlewareURL))

    middlewareResponseList = []

    for meterID in meterIDList:

        PARAMS = {
                'meterId'    : meterID,
                'from'       : from_date_milli,
                'resolution' : 'fifteen_minutes',
                'to'         : to_date_milli
        }

        print('')
        print('Request for Meter Data:')
        print('=======================')
        print('  URL:          h   = {}'.format(middlewareURL))
        print('  Parameter:    h_s = {}'.format(PARAMS))
        print('')

        meterIDObject = {"meterId": meterID}
        meterIDValueList = []
        t0 = time.time()
        try:
            middlewareResponse = helper.requests_retry_session().get(url = middlewareURL, params = PARAMS)

            # extracting data in json format
            print('Extracting data')
            #print('result: ', middlewareResponse)
            middlewareJSONResponse = middlewareResponse.json()
            #print("middlewareResponse: ", middlewareJSONResponse)

            for meterResponse in middlewareJSONResponse:
                #print("meter: ", meterResponse)
                meterItem = {}
                if meterResponse['values']['power']:
                    # delta in W (Power) * * 10^-3
                    power = meterResponse['values']['power'] / 1000
                    #print('Printing delta power: ', power ,' W')
                    if power >= 0:
                        meterItem['consumption'] = int(round(power))
                        meterItem['production'] = 0
                    else:
                        meterItem['consumption'] = 0
                        meterItem['production'] = int(round(power))
                else:
                    print("ERROR: 'power' doesn't exist in middlewareResponse JSON data")

                if meterResponse['time']:
                    meterItem['time'] = meterResponse['time']
                else:
                    print("ERROR: 'time' doesn't exist in middlewareResponse JSON data")

                #print("meterItem: ", meterItem)
                meterIDValueList.append(meterItem)
            meterIDObject['values'] = meterIDValueList
            #print("meterIDValueList: ", meterIDValueList)

        except requests.exceptions.RequestException as e:
            print("ERROR: While sending a GET Request towards the BloGPV Middleware: ", e)
            raise SystemExit(e)
        else:
            print('It eventually worked', middlewareResponse.status_code)
        finally:
            t1 = time.time()
            print('Took', t1 - t0, 'seconds')
            middlewareResponseList.append(meterIDObject)
    return middlewareResponseList

if __name__ == "__main__":
    download()
