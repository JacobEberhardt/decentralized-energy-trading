# -*- coding: utf-8 -*-
import json
import math
import datetime

def extractMeterIDs(json_assetList):
    h   = []                    # List of all households meterIDs

    for user in json_assetList["data"]:
        # ignore undefined users with meterID='NO_METER_AVAILABLE'
        if user['meterId']!='NO_METER_AVAILABLE':
            #print("meterID: ", user['meterId'])
            h.append(user['meterId'])

    print('length of list before dublicate removal: ', len(h))
    h = list(set(h))
    print('length of list after dublicate removal: ', len(h))
    return h

def analyzeMiddlewareResults(filename):

    # Analyse DATA
    with open(filename) as json_file:
        data = json.load(json_file)
        timeList = []
        consumptionOverall = 0
        productionOverall = 0
        for meter in data:
            #print('meterID: ' + meter['meterId'])
            for value in meter['values']:
                #print('time: ', value['time'])
                outputTime = {}
                timeValue = value['time']
                outputTime['time'] = timeValue
                outputValue = {}
                outputValue['consumption'] = value['consumption']
                outputValue['production'] = value['production']
                outputTime['value'] = outputValue

                isNotInTimeList = True
                for time in timeList:
                    #print('time: ', time)
                    #print('timeValue: ', timeValue)
                    if time['time'] == timeValue:
                        isNotInTimeList = False
                        time['value']['consumption'] += value['consumption']
                        consumptionOverall += value['consumption']
                        time['value']['production'] += value['production']
                        productionOverall += value['production']
                        break
                if isNotInTimeList:
                    #print('to add:',outputTime)
                    timeList.append(outputTime)

        # convert to normal time slices
        for time in timeList:
            #print('time: ', time['time'])
            date = datetime.datetime.fromtimestamp(time['time']/1000)
            #print(date.strftime('%Y-%m-%d %H:%M:%S'))
            time['time'] = date.strftime('%H:%M')

        timeList.append({'consumptionOverall': consumptionOverall, 'productionOverall': productionOverall})
        #print('Printing timeList:       ',timeList)

        print('length of timelist:      ',len(timeList))
        print('Consumption overall: ', consumptionOverall,' W')
        print('Production overall: ', productionOverall,' W')
        return timeList

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
