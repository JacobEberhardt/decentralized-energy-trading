import argparse
import json

# Downloader for meter values from remote api: Middleware
from .importer import blogpvmiddleware as meter_api

# Parser for downloaded meter values
#from .parser import json_to_memory as json_parser

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
                        default='http://household-server-1:3002/sensor-stats',
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

    print('Input meterID is ', meterID)
    print('Input middleware URL is ', middlewareURL)
    print('Input household server URL is ', householdServerURL)
    print('Input interval is ', interval)

    middlewareResponse = meter_api.download(meterID,middlewareURL,householdServerURL,interval)
    print('Printing middlewareResponse: ', middlewareResponse)
    #households = json_parser.parse(json_from, json_to)
    #netting_result = net_algo.run(households)

if __name__ == "__main__":
    # Define inputs
    main()
