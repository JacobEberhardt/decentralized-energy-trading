const MongoClient = require("mongodb").MongoClient;

module.exports = {
  createDB: url => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      console.log("Database created!");
      db.close();
    });
  },

  writetoDB: (req, url) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");

      console.log(req.data);
      var myobj = { name: "Company Inc", address: "Highway 37" };
      dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
  },

  readall: url => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      dbo
        .collection("customers")
        .find({})
        .toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
        });
    });
  }
};
