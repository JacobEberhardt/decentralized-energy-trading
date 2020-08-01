import argparse
import json
import datetime
import time
import os.path

# Downloader for meter values from remote api: Middleware
from .importer import blogpvmiddleware as meter_api

# Parser for downloaded meter values and analyzing Middleware Results
from .parser import jsonExtract as json_parser

# Export Results to a JSON File
from .exporter import export as export_JSON

# TODO: change to crontab like: https://stackoverflow.com/questions/57434641/how-to-loop-a-function-to-perform-a-task-every-15-minutes-on-the-0-15-30-45-min
def main():
    parser = argparse.ArgumentParser(description='run glue service')
    parser.add_argument("-meterIDFile",
                        default='./dayimporter/assetListExample/meterIDFile.json',
                        type=str,
                        help="a file which contains all the meterIDs to be retrieved from BloGPV Middleware. like 'meterIDFile.json'")
    parser.add_argument("-endpointSMD",
                        default='https://portal.blogpv.net/api/discovergy/readings',
                        type=str,
                        help="endpoint of Middleware Service to retrieve smart meter data. like: https://abc.blogpv.net/api/discovergy/readings")
    parser.add_argument("-time",
                        default='28.07.2020',
                        type=str,
                        help="a specific day to retrieve from all smart meters. like: 28.07.2020")

    args = parser.parse_args()

    meterIDFile         = args.meterIDFile
    middlewareURL       = args.endpointSMD
    retrievalday        = args.time

    # INPUTS
    print('====================')
    print('Day-Importer-Service Inputs:')
    print('Input Filename containing MeterIDs:  ',meterIDFile)
    print('Input middleware URL:                ',middlewareURL)
    print('Input Day which should be retrieved: ',retrievalday)
    print('====================')

    # extract Smart Meter IDs from InputFile (current ASSETLIST)
    meterIDList = json_parser.extractMeterIDs(meterIDFile)
    #for meterID in meterIDList:
    #    print("meterID: ", meterID)

    # get Smart Meter Date from BloGPV Middleware
    middlewareResponseJSON = meter_api.download(meterIDList, middlewareURL, retrievalday)
    #print('Printing middlewareResponse:      ',middlewareResponseJSON)
    print('middlewareResponse length:        ',len(middlewareResponseJSON))

    # Dump JSON as File
    filename = export_JSON.saveMiddlewareResponseJSON(middlewareResponseJSON, retrievalday, False)
    #filename = 'dayimporter/results/Discovergy_2020-07-28.json'

    # Analyze and Save Result from Middleware
    analyzedList = json_parser.analyzeMiddlewareResults(filename)
    analyzedfilename = export_JSON.saveMiddlewareResponseJSON(analyzedList, retrievalday, True)

    # OUTPUTS
    print('=====================')
    print('Day-Importer-Service Outputs:')
    #print('timestamp smart meter:           ',datetime.datetime.fromtimestamp(deltaObject['time']/1000).strftime('%Y-%m-%d %H:%M:%S'))
    #print('delta energy:                    ',deltaObject['delta'], ' Watt')
    #print('consumption:                     ',deltaObject['consumption'], ' Watt')
    #print('production:                      ',deltaObject['production'], ' Watt')
    print('=====================')

    # HTTP POST to household Server
    #household_api.upload(householdServerURL, deltaObject)

if __name__ == "__main__":
    # Define inputs
    main()
