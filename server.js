const config = require('./config');
const restify = require('restify');
const app = restify.createServer();

const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(config.db.uri, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });


(async () => {

  try {
    await client.connect();
    console.log("connected to MongoDB client")
  } catch(err) {
    console.log(err)
  }

  const usersCollection = client.db(config.db.name).collection("users");

  app.use(restify.plugins.bodyParser());

  app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let errorMessage = null;
    const errorCode = 400;

    if (username && password) {

      if(password.length < 4) {
        errorMessage = "Le mot de passe doit contenir au moins 4 caractères"
      } 

      if (username.length < 2 || username.length > 20) {
        errorMessage = "Votre identifiant doit contenir entre 2 et 20 caractères"
      }  

      if (!(/^[a-z]+$/.test(username))) {
        errorMessage = "Votre identifiant ne doit contenir que des lettres minuscules non accentuées"
      }

      const dbUsers = await usersCollection.find().toArray();
      for (const dbUser of dbUsers) {
        if (dbUser.username == username) {
          errorMessage = "Cet identifiant est déjà associé à un compte"
        }
      }
      

      if (!errorMessage) {
        const user = {
          username: username,
          password: password
        }
        try {
          await usersCollection.insertOne(user)
          res.send({error: errorMessage, token: ""})
        } catch(err) {
          errorMessage = "Une erreur est survenue lors de la création de votre compte. Veuillez réessayer."
          res.send({error: errorMessage})
        }
      } else { //if error message
        res.send({error: errorMessage})
        res.status(errorCode)
      }
    } else { //if no username or no password entered
      errorMessage = "Veuillez renseigner un nom d'utilisateur et un mot de passe."
      res.send({error: errorMessage})
      res.status(errorCode)

    }
  })
})();

app.listen(config.port, function() {
  console.log(`App listening on PORT ${config.port}`);
});
