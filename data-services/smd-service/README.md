# Smart Meter Data Service
For a given specific household, smart meter data should be retrieved and forewarded to the corresponding household-server.

### Input Data
- [STRING] endpoint (A) of Middleware Service to retrieve smart meter data. like: https://abc.companyurl.com/api/
- [STRING] endpoint (B) of household server to foreward retrieved data. like: https://abc.companyurl.com:3200/api/functionName
- [STRING] specific meterID. like: 1234567891234656789123456789
- [NUMBER] interval in seconds to repeat to poll from endpoint A. like: 900s = 15min

### Output Data
- [NUMBER] meterDelta - Delta in Watt (10^-3) of sensor data
- [NUMBER] production - Production in Watt (10^-5) of sensor data
- [NUMBER] consumption - Consumption in Watt (10^-5) of sensor data
- [NUMBER] time - timestamp (epoch in milliseconds) the smart meter data was retrieved

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

Python only:

**1.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance.

```bash
data-services/smd-service/src$ pipenv run glueservice
```

**2.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance via command line.

```bash
data-services/smd-service/src$ pipenv run glueservice -meterID 123456789123456789 -endpointSMD https://abc.companyurl.com/api/ -endpointHPU https://abc.companyurl.com/api/ -interval 900
```

TODO: Build Docker container image:
