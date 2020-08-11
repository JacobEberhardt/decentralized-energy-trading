# Importer Service for Smart Meter Data
For a given list of household, smart meter data for individual time ranges should be retrieved.

### Input Data
- [STRING] endpoint (A) of Middleware Service to retrieve a List of smart meter ids. like: https://abc.companyurl.com/api/functionName
- [STRING] endpoint (B) of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/functionName
- [STRING] a specific day to retrieve from all smart meters within the format YEAR-MONTH-DAY. like: 2020-07-28

### Output Data [JSON-File]
A list of smart meter data with:

| Name     | Type    | Description     | Unit | DSGY_Location   | DSGY_Field     |  DSGY_Function |
| :------------- | :------------- | :------------- | :------------- | :------------- | :------------- | :------------- |
| MId       | string       | meter id - a unique ID for each meter      | ID | Request       | meterId       |   MId =  [meterId]    |
| IDur       | integer       | interval duration - the interval time to retrieve smart meter data       | minutes without decimal places | Request       | resolution=fifteen_minutes       |   IDur =  "resolution=fifteen_minutes"    |
| IEnd       | integer       | interval end - the timestamp where the interval to retrieve smart meter data ends  | milliseconds | Response       | time       |   IEnd =  [time]    |
| PAvg       | decimal       | power average - sum of production and consumption over the interval |  Watt [W] with X? decimal places | Response       | power       |  PAvg = [power]/1000 (from milliwatt to watt) /4 (from 1h to 15min interval)      |
| EIn       | decimal       | energy in - consumed energy during the interval  | Watt/hour [Wh] with X? decimal places | Response | energy       |  EIn = [energy]  / 100000 (smart meter value to watt: 10^-5)    |
| EOut       | decimal       | energy out - produced energy during the interval | Watt/hour [Wh] with X? decimal places  | Response    | energyOut       |  EOut = [energyOut] / 100000 (smart meter value to watt: 10^-5)     |

### Process
(I) Call endpoint A with the given meterID and retrieve the aforementioned output data  
(II) Call endpoint B with a HTTP PUT

## Requirements

- [Python](https://www.python.org/downloads/) >= 3.8.2
- [Pipenv](https://pipenv.pypa.io/en/latest/basics/)

### Install

**1.)** CLI command:
```bash
data-services/importer/dayimporter$ pipenv install
```
**2.)** create environment variables in file "data-services/importer/dayimporter/.env":
```
ENDPOINTRETRIEVEMETERIDS='<INSERT_HERE_THE_HTTP_URL_TO_RETRIEVE_SMART_METER_IDS>'
ENDPOINTSMD='<INSERT_HERE_THE_HTTP_URL_TO_RETRIEVE_SMART_METER_DATA>'
```

### Usage

CLI command:
```bash
$pipenv run dayimporter
```

Parameters:

| Parameter Name  | Type   | Description     |
| :------------- | :-------------| :------------- |
| endpointRetrieveMeterIDs    | string   | endpoint of Middleware Service to retrieve smart meter ids. like: https://abc.companyurl.com/api/       |
| endpointSMD    | string   | endpoint of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/      |
| time    | string   | a specific day to retrieve from all smart meters. like: 2020-07-28     |

**1.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance.

```bash
data-services/smd-service/src$ pipenv run dayimporter
```

**2.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance via command line.

```bash
data-services/smd-service/src$ pipenv run dayimporter -endpointRetrieveMeterIDs https://abc.companyurl.com/api/ -endpointSMD https://abc.companyurl.com/api/ -time 2020-07-28
```
