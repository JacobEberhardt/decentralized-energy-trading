const { MongoClient } = require("mongodb");

module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param {string} url URL/URI of the DB
   * @param {string} dbName name of the created database
   * @param {string[]} collectionList list of all data-collections that are created
   * @returns {boolean} if operation was successful
   */
  createDB: (url, dbName, collectionList) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        console.log("Database created!");
        const dbo = db.db(dbName);
        collectionList.forEach(collection => {
          dbo.createCollection(collection, (err, res) => {
            if (err) reject(err);
            console.log("Collection", collection, "created!");
            db.close();
          });
        });
        resolve(true);
      });
    });
  },

  /**
   * Method to write data to the database.
   * @param {string} url URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection the used collection of the inserted data
   * @param {Object} data the data to add to the DB
   * @returns {Object} data that was written
   */
  writeToDB: (url, dbName, collection, data) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
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
      });
    });
  },

  /**
   * Method to bulk write data to the database.
   * @param {string} url URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection the used collection of the inserted data
   * @param {Object[]} data the data to add to the DB
   * @returns {Object[]} data that was written
   */
  bulkWriteToDB: (url, dbName, collection, data) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
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
            console.log(
              `${data.length} documents inserted to collection ${collection}:`,
              data
            );
            db.close();
            resolve(data);
          }
        );
      });
    });
  },

  /**
   * Method to read data from the database
   * @param {string} url URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @param {Object} filter
   * @returns {Promise} Which either resolves into an Array of objects or rejects an error
   */
  readAll: (url, dbName, collection, filter = {}) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) {
          reject(err);
        }
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          // TODO: Use filter as query
          .find({}, { produce: 1, consume: 1, timestamp: 1 })
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

  getLatestBlockNumber: (url, dbName, collection) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
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
            resolve(results[0].blockNumber);
          });
      });
    });
  },

  /**
   * Method to read data from the database filtered by ID
   * @param {string} url URL/URI of the DB
   * @param {string} dbName Name of db
   * @param {string} collection Name of collection to read from
   * @param {number} id id of the Document
   * @returns {Object} Result as JSONObject
   */
  findByID: (url, dbName, collection, id) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db(dbName);
        dbo
          .collection(collection)
          .findOne({ _id: id })
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
