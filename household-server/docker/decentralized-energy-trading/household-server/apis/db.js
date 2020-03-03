const { MongoClient, ObjectId } = require("mongodb");

/**
 * This module interfaces with the DB.
 */
module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName name of the created database
   * @param {string[]} collectionList list of all data-collections that are created
   * @returns {boolean} if operation was successful
   */
  createDB: (dbUrl, dbName, collectionList) => {
    MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
      if (err) reject(err);
      console.log("Database created!");
      const dbo = db.db(dbName);
      let createPromises = collectionList.map(collection => {
        return new Promise((resolve, reject) => {
          dbo.createCollection(collection, (err, res) => {
            if (err) reject(err);
            console.log("Collection", collection, "created!");
            resolve(db.close());
          });
        })
      }) 
      return Promise.all(createPromises)
      .then(() => {
        initializeMeterReading(dbUrl, dbName, "sensor_data", "meter_reading")
      })
      .catch(err => {
        console.log(err);
      });
    });
  },

  /**
   * Method to write data to the database.
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection the used collection of the inserted data
   * @param {Object} data the data to add to the DB
   * @returns {Object} data that was written
   */
  writeToDB: (dbUrl, dbName, collection, data) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        const dbo = db.db(dbName);
        dbo.collection(collection).insertOne(
          {
            ...data,
            timestamp: new Date().getTime()
          },
          err => {
            if (err) reject(err);
            console.log(
              `1 document inserted to collection ${collection}:`,
              data
            );
            db.close();
            resolve(data);
          }
        );
        resolve(data)
      });
    })
  },

/**
 * Method to update meterReading value
 * @param {string} dbUrl URL/URI of the DB
 * @param {string} dbName Name of db
 * @param {string} collection the used collection of the inserted data
 * @param {Object} data the data to add to the DB
 */
  updateMeterReading: (dbUrl, dbName, collection, data) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        const dbo = db.db(dbName);
        dbo.collection(collection).updateOne(
          { _id: 1 }, { $inc: { value: data.produce - data.consume } }, { upsert: true },
          err => {
            if (err) reject(err);
            db.close();
            resolve();
          }
        );
      });
    })
  },

  /**
   * Method to bulk write data to the database.
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection the used collection of the inserted data
   * @param {Object[]} data the data to add to the DB
   * @returns {Object[]} data that was written
   */
  bulkWriteToDB: (dbUrl, dbName, collection, data) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo.collection(collection).insertMany(
          data.map(entry => ({
            ...entry,
            timestamp: new Date().getTime()
          })),
          err => {
            if (err) {
              reject(err);
            }
            db.close();
            resolve(data);
          }
        );
      });
    });
  },

  /**
   * Method to read data from the database
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @param {Object} filter MongoDB query
   * @returns {Promise} Which either resolves into an Array of objects or rejects an error
   */
  readAll: (dbUrl, dbName, collection, filter = {}) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .find(filter)
          .sort("timestamp", -1)
          .toArray((err, results) => {
            if (err) {
              reject(err);
            }
            db.close();
            resolve(results);
          });
      });
    });
  },

  /**
   * Returns latest saved block number
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @returns {Promise<number>} Latest saved block number.
   */
  getLatestBlockNumber: (dbUrl, dbName, collection) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .find({}, { blockNumber: 1 })
          .sort("blockNumber", -1)
          .toArray((err, results) => {
            if (err) {
              reject(err);
            }
            db.close();
            resolve(results[0] ? results[0].blockNumber : 0);
          });
      });
    });
  },

  /**
   * Returns latest saved timestamp.
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @returns {Promise<number>} Latest saved block number.
   */
  getLatestTimestamp: (dbUrl, dbName, collection) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .find({}, { timestamp: 1 })
          .sort("timestamp", -1)
          .toArray((err, results) => {
            if (err) {
              reject(err);
            }
            db.close();
            resolve(results[0] ? results[0].timestamp : 0);
          });
      });
    });
  },

  /**
   * Returns meterReading from household.
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @returns {Promise<number>} Latest saved block number.
   */
  getMeterReading: (dbUrl, dbName, collection) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .findOne(
            {_id: 1}, 
            (err, results) => {
              if (err) {
                reject(err);
              }
              db.close();
              resolve(results ? results : 0)
            }
          )

      });
    });
  },

  /**
   * Method to read data from the database filtered by ID
   * @param {string} dbUrl URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @param {number} id id of the document
   * @returns {Object} Result as JSONObject
   */
  findByID: (dbUrl, dbName, collection, id) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .findOne({ _id: ObjectId(id.toString()) })
          .then(result => {
            db.close();
            resolve(result);
          })
          .catch(err => {
            if (err) {
              reject(err);
            }
            console.log("Entry with id: ", id, "not found");
          });
      });
    });
  }
};

  /*Initializes meterReading collection with data. Checks if there is sensor_data stored in the db and calcs meter_reading with it
  * @param {string} dbUrl URL/URI of the DB
  * @param {string} dbName Name of db
  * @param {string} collection the used collection of the inserted data
  */
function initializeMeterReading(dbUrl, dbName, collectionSensor, collectionMeter){
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, db) => {
      if (err) reject(err);
      const dbo = db.db(dbName);
      dbo.collection(collectionSensor).mapReduce(
        function () { emit(null, this.produce - this.consume) },
        function (key, value) { return Array.sum(value) },
        {
          out: collectionMeter
        }
      )
        .catch(err => {
          console.log(err)
        })
    });
  })
}