# decentralized-energy-trading

Repository of ISE CP Project Summer 2019.

## Running the Household Server:
Requirements:
- MongoDB installed on the Client -> [Download Link](https://www.mongodb.com/what-is-mongodb)
- MongoDB Driver installed via Yarn
- A client like Postman or Rested to submit GET/PUT requests

To run the server use the Yarn script `yarn run-server`. 
The console now should print:
```
Household Server running at http://127.0.0.1:3000/
Database created!
Collection created!
```
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
## Utility contract

Network configurations are stored `./truffle-config.js`.

Execute

```shell
  # Install dependecies
  $ yarn install
  # Compile contracts
  $ truffle compile
  # Migrate contracts
  $ truffle migrate
  # Test contracts
  $ truffle test
```
