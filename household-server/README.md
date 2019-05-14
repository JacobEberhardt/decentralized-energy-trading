
# Household Server  

## Running the Household Server
Requirements:
- MongoDB installed on the Client -> [Download Link](https://www.mongodb.com/what-is-mongodb)
- A client like Postman or Rested to submit GET/PUT requests

1. Make sure to have all dependencies installed via
```bash
yarn install
```
2. Configure the `household-server-config.js` according to your setup. The defaults are
```javascript
{
  // URL of a running MongoDB instance
  dbUrl: "mongodb://localhost:27017",
  // IP on which the household server should run
  host: "127.0.0.1",
  // Port on which the household server should listen
  port: 3002,
  // Path to the parity key file json of the authority node that is connected to the household server
  authKeyPath: "parity-authority/docker/parity/authorities/authority0.json",
  // Path to the password file to unlock above authority node
  authPasswordPath: "parity-authority/docker/parity/authorities/authority0.pwd",
  // Name of JSON RPC interface specified in `truffle-config.js`
  network: "authority"
}
```
**NOTE: Make sure to have a mongodb running as well as the correct ethereum client.** 

3. To run the server run
```bash
yarn run-server

# The console now should print
Household Server running at http://127.0.0.1:3002/
Database created!
Collection created!
``` 

## Interact with the household-server
To get the Dataflow going, make a PUT request to the address displayed in the console.
This triggers the DBHandler via an event and writes Mock-Data into the DB.
The console should print something like this:
```
PUT Request received
1 document inserted:  { consume: 31.04, produce: 94.8, _id: 5cc9a7cdf711d435d4bca084 }
```
To see all the entries in the DB, simply send a GET request to the same address.
The console should print all the entries in the DB like:
```
[ { _id: 5cc99e80879ce6108875f6c4, consume: 47.03, produce: 41.49 },
  ...
  { _id: 5cc9a7cdf711d435d4bca084, consume: 31.04, produce: 94.8 } ]
  ```
