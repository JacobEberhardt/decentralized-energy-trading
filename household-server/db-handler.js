const { MongoClient } = require("mongodb");

module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param {String} url URL/URI of the DB
   * @returns {boolean} if operation was successful

   */
  createDB: url => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        console.log("Database created!");
        const dbo = db.db("sensordata");
        dbo.createCollection("data", (err, res) => {
          if (err) reject(err);
          console.log("Collection created!");
          db.close();
          resolve(true);
        });
      });
    });
  },

  /**
   * Method to write data to the database. Should be added as Eventlistener to incoming PUT requests of the Sensors
   * @param {JSONObject} data the data to add to the DB
   * @param {String} url URL/URI of the DB
   * @returns {boolean} if operation was successful

   */
  writeToDB: (data, url) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        const dbo = db.db("sensordata");
        dbo.collection("data").insertOne(data, (err, res) => {
          if (err) reject(err);
          console.log("1 document inserted: ", data);
          db.close();
          resolve(true);
        });
      });
    });
  },

  /**
   * Method to read data from the database
   * @param {string} url URL/URI of the DB
   * @param {string} collection Name of collection to read from
   * @param {Object} filter
   * @returns {Promise} Which either resolves into an Array of objects or rejects an error
   */
  readAll: (url, collection, filter = {}) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        const dbo = db.db("sensordata");
        dbo
          .collection(collection)
          // TODO: Use filter as query
          .find({}, { produce: 1, consume: 1, _id: 1 })
          .toArray((err, results) => {
            if (err) {
              reject(err);
            }
            db.close();
            const resultsWithTimestamp = results.map(doc => ({
              ...doc,
              timestamp: new Date(doc._id.getTimestamp()).getTime()
            }));
            resolve(resultsWithTimestamp);
          });
      });
    });
  },
  /**
   * Method to read data from the database filtered by ID
   * @param {String} url URL/URI of the DB
   * @param {Number} id id of the Document
   * @returns {JSONObject} Result as JSONObject
   */
  findByID: (url, id) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db("sensordata");
        dbo
          .collection("data")
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
