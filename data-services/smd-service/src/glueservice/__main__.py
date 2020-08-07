import argparse
import json
import datetime
import time
import os

from os import environ
from dotenv import load_dotenv

# Downloader for meter values from remote api: Middleware
from .importer import blogpvmiddleware as meter_api

# Parser for downloaded meter values
from .parser import jsonExtract as json_parser

# Uploader to household remote api
from .exporter import householdserver as household_api

# Get Environment Variables if setup
load_dotenv()

# TODO: change to crontab like: https://stackoverflow.com/questions/57434641/how-to-loop-a-function-to-perform-a-task-every-15-minutes-on-the-0-15-30-45-min
def main():

    parser = argparse.ArgumentParser(description='run glue service')
    parser.add_argument("-meterID",
                        type=str,
                        help="meterID which should be retrieved from BloGPV Middleware")
    parser.add_argument("-endpointSMD",
                        type=str,
                        help="endpoint of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/")
    parser.add_argument("-endpointHPU",
                        type=str,
                        help="endpoint (B) of household processing unit to foreward retrieved data. like. https://abc.companyurl.com/api/")
    parser.add_argument("-interval",
                        default='900',
                        type=int,
                        help="interval in seconds to repeat to poll from endpoint A. like: 900s = 15min")

    args = parser.parse_args()

    # if set, get environment variables
    meterID                     = args.meterID
    endpointRetrieveMeterData   = args.endpointSMD
    endpointHouseholdServerURL  = args.endpointHPU
    interval                    = args.interval

    if meterID is None and environ.get('METERID') is not None:
        meterID = os.getenv("METERID")
    if endpointRetrieveMeterData is None and environ.get('ENDPOINTSMD') is not None:
        endpointRetrieveMeterData = os.getenv("ENDPOINTSMD")
    if endpointHouseholdServerURL is None and environ.get('ENDPOINTHOUSEHOLDSERVER') is not None:
        endpointHouseholdServerURL = os.getenv("ENDPOINTHOUSEHOLDSERVER")

    # INPUTS
    print('====================')
    print('Glue-Service Inputs:')
    print('Input meterID:                   ',meterID)
    print('Input middleware URL:            ',endpointRetrieveMeterData)
    print('Input household server URL:      ',endpointHouseholdServerURL)
    print('Input interval:                  ',interval, 'seconds')
    print('====================')

    # get Smart Meter Date from BloGPV Middleware
    middlewareResponseJSON = meter_api.download(meterID, endpointRetrieveMeterData, interval)
    print('Printing middlewareResponse:     ',middlewareResponseJSON)

    # parsing JSON
    deltaObject = json_parser.parse(middlewareResponseJSON)

    # OUTPUTS
    print('=====================')
    print('Glue-Service Outputs:')
    print('timestamp smart meter:           ',datetime.datetime.fromtimestamp(deltaObject['time']/1000).strftime('%Y-%m-%d %H:%M:%S'))
    print('delta energy:                    ',deltaObject['delta'], ' Watt')
    print('consumption:                     ',deltaObject['consumption'], ' Watt')
    print('production:                      ',deltaObject['production'], ' Watt')
    print('=====================')

    # HTTP POST to household Server
    household_api.upload(endpointHouseholdServerURL, deltaObject)

if __name__ == "__main__":
    # Define inputs
    main()
