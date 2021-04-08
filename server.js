var restify = require('restify');
var app = restify.createServer();
//const { uri, dbName, client } = require('./mongodb-connection')

const PORT = 8080 || process.env.PORT

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://admin:admin@notes-api.ezzrd.mongodb.net/notes-api?retryWrites=true&w=majority";
const dbName = "notes-api";

const client = new MongoClient(uri, { useUnifiedTopology: true });

app.use(restify.plugins.bodyParser());
app.use(restify.plugins.jsonBodyParser({ mapParams: true }));
app.use(restify.plugins.acceptParser(app.acceptable));
app.use(restify.plugins.queryParser({ mapParams: true }));
app.use(restify.plugins.fullResponse());

(async () => {
  await client.connect();

  const db = client.db(dbName).collection("notes");

  app.get('/notes', async (req,res) => {
    const docs = await db.find({}).toArray();
    res.send(docs);
  });

  app.put('/notes', async(req,res) => {
    let user = '606f1c15fc296d902fa4f232';
    try{
      if(user == null || user == ''){
        res.send("Utilisateur non connecté");
        res.status(401);
      }else{
        await db.insertOne({
          userId: user, 
          content: req.body.note,
          createdAt: new Date(),
          lastUpdatedAt: null
        });
      }

    }catch(err){
      console.log(err);
    }
  });

  app.get('/', (req,res) => {
    res.send("Hello world")
    console.log(uri)
  });

})();

app.listen(PORT, function() {
  console.log(`App listening on PORT ${PORT}`);
});