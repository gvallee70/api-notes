require('dotenv').config();
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const restify = require('restify');

const app = restify.createServer();

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;


const client = new MongoClient(process.env.MONGODB_URI, 
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

  const usersCollection = client.db(process.env.DB_NAME).collection("users");
  const notesCollection = client.db(process.env.DB_NAME).collection("notes")

  app.use(restify.plugins.bodyParser());

  // Sign up
  app.post('/signup', async (req, res) => {
    let {username, password} = req.body
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

      const dbUsers = await usersCollection.find({username}).toArray();
      for (const dbUser of dbUsers) {
        if (dbUser.username == username) {
          errorMessage = "Cet identifiant est déjà associé à un compte"
        }
      }
      
      if (!errorMessage) {
        password = bcrypt.hashSync(password, 10); //hash le mot de passe avec l'algorithme bcrypt
        const user = {
          username: username,
          password: password
        }
        try {
          await usersCollection.insertOne(user)
          token = jwt.sign(user, process.env.JWT_KEY, {
            expiresIn: '24h'
          });
          res.json({error: errorMessage, token: token})
        } catch(err) {
          errorMessage = "Une erreur est survenue lors de la création de votre compte. Veuillez réessayer."
          res.json({error: errorMessage})
        }
      } else { //if error message
        res.json(errorCode, {error: errorMessage})
      }
    } else { //if no username or no password entered
      errorMessage = "Veuillez renseigner un nom d'utilisateur et un mot de passe."
      res.json(errorCode, {error: errorMessage})
    }
  })

  // Sign in
  app.post('/signin', (req, res) => {
    const username = req.body.username || "";
    const password = req.body.password || "";

    if (password.length < 4) {
      return res.send(400, {
        error: 'Le mot de passe doit contenir au moins 4 caractères'
      });
    }
    if (!(/^[a-z]+$/.test(username))) {
      return res.send(400, {
        error: 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées'
      });
    }
    if (username.length < 2 || username.length > 20) {
      return res.send(400, {
        error: 'Votre identifiant doit contenir entre 2 et 20 caractères'
      });
    }
   
    usersCollection.findOne({ username }, (err, user) => {
      if (err) {
        return res.send(500, {
          error: err
        });
      } else {
        if (!user) {
          return res.send(403, {
            error: 'Cet identifiant est inconnu'
          });
        }

        if (bcrypt.compareSync(password, user.password)) {
          let token = jwt.sign(user, process.env.JWT_KEY, {
            expiresIn: '24h'
          });
          return res.send(200, {
            error: null,
            token: token
          });
        } else {
          return res.send(400, {
            error: 'Mot de passe invalide'
          });
        }
    }
    });
  })
  
  // Get notes
  app.get('/notes', async (req,res) => {

    let token = req.header('x-access-token');

    if(!token){
      return res.send(401, {
        error: "Utilisateur non connecté"
      });
    }

    jwt.verify(token, process.env.JWT_KEY, (err,decoded) => {
      if(err || !decoded){
        return res.send(401, {
          error: "Utilisateur non connecté"
        });
      }
      let userId = decoded._id;
      notesCollection.find({ userId: userId }).toArray((err, notes) => {
        if(err){
          return res.send(500, {
            error : err
          });
        }
        return res.send(200, {
          error : null,
          notes : notes
        });
      });
    });
    
  });

  // Add note
  app.put('/notes', async(req,res) => {
    
    let token = req.header('x-access-token');

    if(!token){
      return res.send(401, {
        error: "Utilisateur non connecté"
      });
    }

    jwt.verify(token, process.env.JWT_KEY, (err,decoded) => {
      if(err || !decoded){
        return res.send(401, {
          error: "Utilisateur non connecté"
        });
      }
      let userId = decoded._id;
      const note = {
        content: req.body.content ? req.body.content : null,
        userId: userId, 
        createdAt: new Date(),
        lastUpdatedAt: null
      }
      notesCollection.insertOne(note, function (err, newNote) {
        if(err){
          return res.send(500, {
            error : "Impossible de créer la note"
          })
        }
        console.log(note);
        if (newNote) {
          res.send(200, {
            error: null,
            note: {
              _id: newNote.insertedId,
              ...note
            }
          });
        }

      });
    });
  });

  // Delete note
  app.del('/notes/:id', (req, res) => {
    let token = req.header('x-access-token');

    if (!token) {
      return res.send(401, {
        error: 'Utilisateur non connecté'
      });
    }

    jwt.verify(token, process.env.JWT_KEY,async (err, authUser) => {
      if (err) {
        return res.send(500, {
          error: 'Impossible de vous authentifier'
        });
      }
      if (!authUser) {
        return res.send(401, {
          error: 'Utilisateur non connecté'
        });
      }

      let note;
      try {
        const _id = new ObjectID(req.params.id)
        note = await notesCollection.findOne({ _id: _id })
      } catch (err) {
        console.log(err)
      }

      if (!note) {
        return res.send(404, { 
          error: 'Cet identifiant est inconnu'
        })
      }

      if (note.userId !== authUser._id) {
        return res.send(403, { 
          error: 'Accès non autorisé à cette note'
        })
      }

      try {
        await notesCollection.deleteOne({ _id: note._id });
        return res.send(200, {
          error: null
        })
      } catch(err) {
        return res.send(500, {
          error: 'Impossible de supprimer la note. '
        })
      }
    

    });
  });

  app.listen(process.env.PORT, function() {
    console.log(`App listening on PORT ${process.env.PORT}`);
  });
})();
