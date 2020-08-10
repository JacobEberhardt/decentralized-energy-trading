# Importer Service for Smart Meter Data
For a given list of household, smart meter data for individual time ranges should be retrieved.

### Input Data
- [STRING] endpoint (A) of Middleware Service to retrieve a List of smart meter ids. like: https://abc.companyurl.com/api/functionName
- [STRING] endpoint (B) of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/functionName
- [STRING] a specific day to retrieve from all smart meters. like: 28.07.2020

### Output Data [JSON-File]
A list of smart meter data with:

| Name     | Type    | Description     | DSGY_Function    | DSGY_Field     | DSGY_Location |
| :------------- | :------------- | :------------- | :------------- | :------------- | :------------- |
| MId       | string       | unique ID for each Meter       | no changes       | meterId       | Request       |
| IDur       | integer       | in minutes without decimal places       | no changes       | resolution=fifteen_minutes       | Request       |
| IEnd       | integer       | X? milisecond timestamp       | no changes       | time       | Response       |
| PAvg       | decimal       | in Watt [W] with X? decimal places       | /1000 (from miliwatt to watt) /4 (from 1h to 15min interval)       | power       | Response       |
| EIn       | decimal       | in Watt/hour [Wh] with X? decimal places       | / 100000 (smart meter value to watt: 10^-5)       | energy       | Response       |
| EOut       | decimal       | in Watt/hour [Wh] with X? decimal places       | / 100000 (smart meter value to watt: 10^-5)       | energyOut       | Response       |





### Process
(I) Call endpoint A with the given meterID and retrieve the aforementioned output data  
(II) Call endpoint B with a HTTP PUT

## Requirements

- [Python](https://www.python.org/downloads/) >= 3.8.2
- [Pipenv](https://pipenv.pypa.io/en/latest/basics/)

### Install

**1.)** CLI command:
```bash
data-services/smd-service/src$ pipenv install
```
**2.)** create environment variables in file "data-services/smd-service/src/glueservice/.env":
```
ENDPOINTSMD='<INSERT_HERE_THE_HTTP_URL_TO_RETRIEVE_SMART_METER_DATA>'
ENDPOINTHOUSEHOLDSERVER='<INSERT_HERE_THE_HTTP_URL_TO_SEND_THE_SMART_METER_DATA_TO>'
METERID='<INSERT_HERE_THE_SMART_METER_ID_YOU_WANT_TO_RETRIEVE_AND_SEND>'
```

### Usage

CLI command:
```bash
$pipenv run glueservice
```

Parameters:

| Parameter Name  | Type   | Description     |
| :------------- | :-------------| :------------- |
| endpointRetrieveMeterIDs    | string   | endpoint of Middleware Service to retrieve smart meter ids. like: https://abc.companyurl.com/api/       |
| endpointSMD    | string   | endpoint of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/      |
| time    | string   | a specific day to retrieve from all smart meters. like: 28.07.2020     |

**1.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance.

```bash
data-services/smd-service/src$ pipenv run glueservice
```

**2.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance via command line.

```bash
data-services/smd-service/src$ pipenv run glueservice -meterID 123456789123456789 -endpointSMD https://abc.companyurl.com/api/ -endpointHPU https://abc.companyurl.com/api/ -interval 900
```
