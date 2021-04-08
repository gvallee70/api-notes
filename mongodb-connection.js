const MongoClient = require("mongodb").MongoClient;

const dbName = "notes-api";
const uri = "mongodb+srv://admin:<password>@notes-api.ezzrd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useUnifiedTopology: true });

module.exports = {
    dbName,
    uri,
    client
   };