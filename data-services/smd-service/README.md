# Smart Meter Data Service
For a given specific household, smart meter data should be retrieved and forewarded to the corresponding household-server.

### Input Data
- [STRING] endpoint (A) of Middleware Service to retrieve smart meter data. like: https://abc.blogpv.net/api/discovergy/readings
- [STRING] endpoint (B) of household server to foreward retrieved data. like: http://household-server-1:3002/sensor-stats
- [STRING] specific meterID. like: 235838ce7cd94ff9e1beca2906a5e620
- [NUMBER] interval in seconds to repeat to poll from endpoint A. like: 900s = 15min

### Process
(I) Call endpoint A with the given meterID and retrieve:
- [NUMBER] meterDelta - Delta in Watt (10^-3) of sensor data
- [NUMBER] production - Production in Watt (10^-5) of sensor data
- [NUMBER] consumption - Consumption in Watt (10^-5) of sensor data
- [NUMBER] time - timestamp (epoch in milliseconds) the smart meter data was retrieved

(II) Call endpoint B with a HTTP PUT and the aforementioned values

### Usage

Python only:

#### Install

Get CLI command:
```bash
data-services/smd-service/src$ pipenv install
```
**1.)** Download BloGPV Smart Meter Data from Middleware API and foreward the data to a local household server instance.

```bash
data-services/smd-service/src$ pipenv run glueservice
```

TODO: Build Docker container image: