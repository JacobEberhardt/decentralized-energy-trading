# Mock Sensor 

## Running the Mock Sensor

1. Make sure to have all dependencies installed via
```bash
yarn install
```

2. Run the Mock sensor with
```bash
yarn run-sensor
```
To adjust the energy balance add the flag
```bash
yarn run-sensor -e -
```
For consumption > production
OR
```bash
yarn run-sensor -e +
```
For consumption < production

3. The settings for consumption and production can be set in `sensor-config.js`.
The setting for the sensor interval are set in the `household-server-config.js` in root.

4. The output of the sensor sending to the Household Server should look like this:
```bash
{ produce: 14.19, consume: 92.33 }
```