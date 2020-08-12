import argparse
import json
import datetime
import time
import os.path
from os import environ
from dotenv import load_dotenv

# Downloader for meter values from remote api: Middleware
from .importer import blogpvmiddleware as meter_api

# Parser for downloaded meter values and analyzing Middleware Results
from .parser import jsonExtract as json_parser

# Export Results to a JSON File
from .exporter import export as export_JSON

# Get Environment Variables if setup
load_dotenv()

# TODO: change to crontab like: https://stackoverflow.com/questions/57434641/how-to-loop-a-function-to-perform-a-task-every-15-minutes-on-the-0-15-30-45-min
def main():

    parser = argparse.ArgumentParser(description='run glue service')
    parser.add_argument("-endpointRetrieveMeterIDs",
                        type=str,
                        help="endpoint of Middleware Service to retrieve smart meter ids. like: https://abc.companyurl.com/api/")
    parser.add_argument("-endpointSMD",
                        type=str,
                        help="endpoint of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/")
    parser.add_argument("-time",
                        default='2020-07-31',
                        type=str,
                        help="a specific day to retrieve from all smart meters. like: 2020-08-10")

    args = parser.parse_args()

    # if set, get environment variables
    endpointRetrieveMeterIDs    = args.endpointRetrieveMeterIDs
    endpointRetrieveMeterData   = args.endpointSMD
    retrievalday                = args.time

    if endpointRetrieveMeterIDs is None and environ.get('ENDPOINTRETRIEVEMETERIDS') is not None:
        endpointRetrieveMeterIDs = os.getenv("ENDPOINTRETRIEVEMETERIDS")
    if endpointRetrieveMeterData is None and environ.get('ENDPOINTSMD') is not None:
        endpointRetrieveMeterData = os.getenv("ENDPOINTSMD")

    # INPUTS
    print('====================')
    print('Day-Importer-Service Inputs:')
    print('Input URL for retrieving MeterIDs:           ',endpointRetrieveMeterIDs)
    print('Input URL for retrieving Smart Meta Data:    ',endpointRetrieveMeterData)
    print('Input Day which should be retrieved:         ',retrievalday)
    print('====================')

    # get MeterID List
    json_assetList = meter_api.retrieveMeterIDs(endpointRetrieveMeterIDs)
    #print('Printing json_assetList:      ',json_assetList)
    print('json_assetList length:        ',len(json_assetList['data']))

    # extract Smart Meter IDs from InputFile (current ASSETLIST)
    meterIDList = json_parser.extractMeterIDs(json_assetList)
    #for meterID in meterIDList:
    #    print("meterID: ", meterID)

    # get Smart Meter Date from BloGPV Middleware
    middlewareResponseJSON = meter_api.downloadMeterData(meterIDList, endpointRetrieveMeterData, retrievalday)
    #print('Printing middlewareResponse:      ',middlewareResponseJSON)
    print('middlewareResponse length:        ',len(middlewareResponseJSON))

    # Dump JSON as File
    filename = export_JSON.saveMiddlewareResponseJSON(middlewareResponseJSON, retrievalday, False)
    #filename = 'dayimporter/results/Discovergy_2020-07-28.json'

    # Analyze and Save Result from Middleware
    #analyzedList = json_parser.analyzeMiddlewareResults(filename)
    #analyzedfilename = export_JSON.saveMiddlewareResponseJSON(analyzedList, retrievalday, True)

    # OUTPUTS
    print('=====================')
    print('Day-Importer-Service Outputs:')
    print('Day-Importer Results:           ',filename)
    #print('Day-Importer analyzed Results:  ',analyzedfilename)
    print('=====================')

if __name__ == "__main__":
    # Define inputs
    main()
