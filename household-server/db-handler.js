// This Handler processes the input from the smart meters
module.exports = (req, res) => {
  console.log("DataBase Handler received: ", req);
  const MongoClient = require("mongodb").MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { address: "Park Lane 38" };
    dbo
      .collection("customers")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
  });
};
