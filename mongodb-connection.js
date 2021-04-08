const MongoClient = require("mongodb").MongoClient;

const dbName = "notes-api";
const uri = "mongodb+srv://admin:<admin>@notes-api.ezzrd.mongodb.net/notes-api?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useUnifiedTopology: true });

module.exports = {
    dbName,
    uri,
    client
   };