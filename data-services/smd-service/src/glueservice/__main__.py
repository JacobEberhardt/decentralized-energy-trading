import argparse
import json
import datetime
import time

# Downloader for meter values from remote api: Middleware
from .importer import blogpvmiddleware as meter_api

# Parser for downloaded meter values
from .parser import jsonExtract as json_parser

# Uploader to household remote api
from .exporter import householdserver as household_api

# TODO: change to crontab like: https://stackoverflow.com/questions/57434641/how-to-loop-a-function-to-perform-a-task-every-15-minutes-on-the-0-15-30-45-min
def main():
    parser = argparse.ArgumentParser(description='run glue service')
    parser.add_argument("-meterID",
                        default='9084bf04f4704917a23fd61da1845379',
                        type=str,
                        help="meterID which should be retrieved from BloGPV Middleware")
    parser.add_argument("-endpointSMD",
                        default='https://portal.blogpv.net/api/discovergy/readings',
                        type=str,
                        help="endpoint of Middleware Service to retrieve smart meter data. like: https://abc.blogpv.net/api/discovergy/readings")
    parser.add_argument("-endpointHPU",
                        default='http://127.0.0.1:3002/sensor-stats',
                        type=str,
                        help="endpoint (B) of household processing unit to foreward retrieved data. like: http://household-server-1:3002/sensor-stats")
    parser.add_argument("-interval",
                        default='900',
                        type=int,
                        help="interval in seconds to repeat to poll from endpoint A. like: 900s = 15min")

    args = parser.parse_args()

    meterID             = args.meterID
    middlewareURL       = args.endpointSMD
    householdServerURL  = args.endpointHPU
    interval            = args.interval

    # INPUTS
    print('====================')
    print('Glue-Service Inputs:')
    print('Input meterID:                   ',meterID)
    print('Input middleware URL:            ',middlewareURL)
    print('Input household server URL:      ',householdServerURL)
    print('Input interval:                  ',interval, 'seconds')
    print('====================')

    # get Smart Meter Date from BloGPV Middleware
    middlewareResponseJSON = meter_api.download(meterID, middlewareURL, interval)
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
    household_api.upload(householdServerURL, deltaObject)

if __name__ == "__main__":
    # Define inputs
    main()
