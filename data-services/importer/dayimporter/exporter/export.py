# importing libraries
import requests
import json
import datetime
import os.path
import time

# Write output to this folder.
OUT_DIR = 'dayimporter/results'

def saveMiddlewareResponseJSON(middlewareResponseJSON, retrievalday, analyzed):

    # file name format
    t = datetime.datetime.now()
    retrieveday = datetime.datetime.strptime(retrievalday, '%Y-%m-%d')
    fileNameEnding = '.json'
    if analyzed:
        fileNameEnding = '_analyzed.json'
    filename = '{}{:%Y-%m-%d}{}'.format('Discovergy_', retrieveday, fileNameEnding)

    # join filename and folder
    file = os.path.join(OUT_DIR, filename)
    print('Writing middlewareResponseJSON to file: {}'.format(file))

    # INPUTS
    print('====================')
    print('SAVE FILE Inputs:')
    print('Input length of Resultset from Middleware:       ',len(middlewareResponseJSON))
    print('Input retrievalday:                              ',retrievalday)
    print('Input output Folder:                             ',OUT_DIR)
    print('Input Filename:                                  ',file)
    print('====================')

    with open(file, 'w') as outfile:
        json.dump(middlewareResponseJSON, outfile)

    # return filename
    return file

def saveAnalyzedMiddlewareResponseJSON(analyzedJSON, retrievalday):

    # file name format
    t = datetime.datetime.now()
    retrieveday = datetime.datetime.strptime(retrievalday, '%Y-%m-%d')
    filename = '{}{:%Y-%m-%d}{}'.format('Discovergy_', retrieveday, '.json')

    # join filename and folder
    file = os.path.join(OUT_DIR, filename)
    print('Writing middlewareResponseJSON to file: {}'.format(file))

    # INPUTS
    print('====================')
    print('SAVE FILE Inputs:')
    print('Input length of Resultset from Middleware:       ',len(middlewareResponseJSON))
    print('Input retrievalday:                              ',retrievalday)
    print('Input output Folder:                             ',OUT_DIR)
    print('Input Filename:                                  ',file)
    print('====================')

    with open(file, 'w') as outfile:
        json.dump(middlewareResponseJSON, outfile)

    # return filename
    return file

if __name__ == "__main__":
    download()
