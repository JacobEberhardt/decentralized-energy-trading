const { MongoClient } = require("mongodb");

module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param {String} url URL/URI of the DB
   * @returns {boolean} if operation was successful

   */
  createDB: url => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      console.log("Database created!");
      const dbo = db.db("sensordata");
      dbo.createCollection("data", (err, res) => {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
        return true;
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
    console.log(url);
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db("sensordata");
      dbo.collection("data").insertOne(data, (err, res) => {
        if (err) throw err;
        console.log("1 document inserted: ", data);
        db.close();

        return true;
      });
    });
  },

  /**
   * Method to read data from the database
   * @param {String} url URL/URI of the DB
   * @returns {Promise} Which either resolves into an Array of objects or rejects an error
   */
  readAll: url => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) reject(err);
        const dbo = db.db("sensordata");
        dbo
          .collection("data")
          .find({})
          .toArray((err, result) => {
            if (err) reject(err);
            db.close();
            resolve(result);
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
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db("sensordata");
      dbo
        .collection("data")
        .findOne({ _id: id })
        .then(result => {
          console.log(
            result.produce,
            result.consume,
            result._id,
            result._id.getTimestamp().toString()
          );
          db.close();

          return result;
        })
        .catch(err => {
          if (err) {
          }
          console.log("Entry with id: ", id, "not found");
        });
    });
  }
};
