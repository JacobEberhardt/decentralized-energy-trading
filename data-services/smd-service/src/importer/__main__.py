import math
import argparse
import os
import json

# Netting algorithm: 'Proportional Netting'
from .algorithm import proportional as net_algo

# Downloader for meter values from remote api: Discovergy 
from .loader import discovergy as meter_api

# Parser for downloaded meter values
from .parser import json_to_memory as json_parser

def main():
    parser = argparse.ArgumentParser(description='run netting algorithm')
    parser.add_argument("-ifrom",
                        default='samples/Discovergy_RecentData_FROM.json',
                        type=str,
                        help="Input File From")
    parser.add_argument("-ito",
                        default='samples/Discovergy_RecentData_TO.json',
                        type=str,
                        help="Input File From")

    args = parser.parse_args()

    inputfile_from = args.ifrom
    inputfile_to = args.ito

    print('Input_From file is ', inputfile_from)
    print('Input_To file is ', inputfile_to)

    with open(inputfile_from) as f_from:
        json_from = json.load(f_from)

    with open(inputfile_to) as f_to:
        json_to = json.load(f_to)

    households = json_parser.parse(json_from, json_to)
    netting_result = net_algo.run(households)

if __name__ == "__main__":
    # Define inputs
    main()