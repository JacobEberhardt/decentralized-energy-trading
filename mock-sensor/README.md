# Mock Sensor

## Get started

1. Make sure to have all dependencies installed via

```bash
yarn install
```

2. Run the Mock sensor, add corresponding flags

```bash
yarn run-sensor
# add -h flag for custom hostname
yarn run-sensor -h <hostname>
# add -p flag for custom port
yarn run-sensor -p <port>
# add -r flag for custom route
yarn run-sensor -r <route>
# add -i flag for custom interval
yarn run-sensor -i <interval>
# add -e flag for custom energybalance
# consumption > production
yarn run-sensor -e -
# consumption < production
yarn run-sensor -e +
# add -m flag for sensor mode:
# Mode 1: Sensor sends produce and consume values (default)
# Mode 2: Sensor sends single meterReading value, which gets updated
yarn run-sensor -m 2
```

3. The settings for consumption and production can be set in `sensor-config.js`.
   The setting for the sensor interval are set in the `household-server-config.js` in root.

4. The output of the sensor sending to the Household Server should look like this:

```bash
{ produce: 14.19, consume: 92.33 }
```
