# -*- coding: utf-8 -*-
import json
import math

def parse(middlewareResponseJSON):

    # define return object as JSON
    returnObject = {}

    # extract delta for household server
    if len(middlewareResponseJSON)==2:
        for i in range(0, 1):

            # time
            if middlewareResponseJSON[i+1]['time']:
                #print('Printing time: ', middlewareResponseJSON[i+1]['time'])
                returnObject['time'] = middlewareResponseJSON[i+1]['time']
            else:
                print("ERROR: 'time' doesn't exist in middlewareResponse JSON data")

            # check if 'values' parameter exists
            if middlewareResponseJSON[i]['values'] and middlewareResponseJSON[i+1]['values']:

                # check if 'power' parameter exists
                if middlewareResponseJSON[i]['values']['power'] and middlewareResponseJSON[i+1]['values']['power']:
                    # delta in W (Power) * * 10^-3
                    power = middlewareResponseJSON[i+1]['values']['power'] / 1000
                    #print('Printing delta power: ', power ,' W')
                    returnObject['delta'] = power
                else:
                    print("ERROR: 'power' doesn't exist in middlewareResponse JSON data")

                # check if 'energy' parameter exists
                if middlewareResponseJSON[i]['values']['energy'] and middlewareResponseJSON[i+1]['values']['energy']:
                    # energy Wh = * 10^-5 * 4 (Wh über 15min weitergedreht) * 10^-2
                    energy = ((middlewareResponseJSON[i+1]['values']['energy'] - middlewareResponseJSON[i]['values']['energy']) / 10000000 ) * 4
                    #print('energy[',i,']: ', middlewareResponseJSON[i]['values']["energy"] / 1000)
                    #print('energy: ', energy)
                    returnObject['consumption'] = energy
                else:
                    print("ERROR: 'energy' doesn't exist in middlewareResponse JSON data")

                # check if 'energyOut' parameter exists
                if middlewareResponseJSON[i]['values']['energyOut'] and middlewareResponseJSON[i+1]['values']['energyOut']:
                    # energyOut Wh = * 10^-5 * 4 (Wh über 15min weitergedreht) * 10^-2
                    energyOut = ((middlewareResponseJSON[i+1]['values']['energyOut'] - middlewareResponseJSON[i]['values']['energyOut']) / 10000000 ) * 4
                    #print('energyOut[',i,']: ', middlewareResponseJSON[i]['values']["energyOut"] / 1000)
                    #print('energyOut: ', energyOut)
                    returnObject['production'] = energyOut
                else:
                    print("ERROR: 'energyOut' doesn't exist in middlewareResponse JSON data")

            else:
                print("ERROR: 'values' doesn't exist in middlewareResponse JSON data")

    else:
        print("ERROR: Wrong size of JSON-ReturnArray from Middleware. Please try again.")
        raise SystemExit()

    return returnObject

if __name__ == "__main__":
    pass
    # TODO Implement function
    # inputfile_from = {}
    # inputfile_to = {}
    # result = parse(inputfile_from, inputfile_to)
    # print('Result for inputfile_from {} and inputfile_to {} is {}'.format(inputfile_from, inputfile_to, result))
