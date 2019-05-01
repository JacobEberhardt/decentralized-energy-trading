const MongoClient = require("mongodb").MongoClient;

module.exports = {
  /**
   * Method to create the DB and Initialize it with a Collection
   * @param url URL/URI of the DB
   */
  createDB: url => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      console.log("Database created!");
      var dbo = db.db("sensordata");
      dbo.createCollection("data", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
      });
    });
  },

  /**
   * Method to write data to the database. Should be added as Eventlistener to incoming PUT requests of the Sensors
   * @param req the data to add to the DB
   * @param url URL/URI of the DB
   */
  writetoDB: (req, url) => {
    console.log(url);
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("sensordata");
      console.log(req);
      var myobj = req;
      dbo.collection("data").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted: ", myobj);
        db.close();
      });
    });
  },

  /**
   * Method to read data from the database
   * Should be added as an Eventlistener for incoming GET Requests from the UI
   * @param url URL/URI of the DB
   */
  readall: url => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("sensordata");
      dbo
        .collection("data")
        .find({})
        .toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
        });
    });
  }
};
