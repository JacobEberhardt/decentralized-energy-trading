const MongoClient = require("mongodb").MongoClient;

module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param url URL/URI of the DB
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
      });
    });
  },

  /**
   * Method to write data to the database. Should be added as Eventlistener to incoming PUT requests of the Sensors
   * @param data the data to add to the DB
   * @param url URL/URI of the DB
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
      });
    });
  },

  /**
   * Method to read data from the database
   * Should be added as an Eventlistener for incoming GET Requests from the UI
   * @param url URL/URI of the DB
   */
  readAll: url => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db("sensordata");
      dbo
        .collection("data")
        .find({})
        .toArray((err, result) => {
          if (err) throw err;
          console.log(result);
          db.close();
        });
    });
  }
};
