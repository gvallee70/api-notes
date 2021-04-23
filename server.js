const database = require('./database');
const Notes = require('./models/notes');
const User = require('./models/user');

const NotesController = require('./controllers/notes-controller');

require('dotenv').config();
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const restify = require('restify');

const app = restify.createServer();

const ObjectID = require('mongodb').ObjectID;

(async () => {
  await database.connect();

  const usersCollection = database.db.collection('users');
  const notesCollection = database.db.collection('notes');

  app.use(restify.plugins.bodyParser());

  // Sign up
  app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send(400, {
        error: 'Saisissez un identifiant et un mot de passe'
      });
    }

    User.signup(username, password, (statusCode, errorMessage, token) => {
      if (statusCode == 200) {
        return res.send(200, {
          error: errorMessage,
          token: token
        });
      } else {
        return res.send(statusCode, {
          error: errorMessage
        });
      }
    });
  })

  // Sign in
  app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send(400, {
        error: 'Saisissez un identifiant et un mot de passe'
      });
    }

    User.signin(username, password, (statusCode, errorMessage, token) => {
      if (statusCode == 200) {
        return res.send(200, {
          error: errorMessage,
          token: token
        });
      } else {
        return res.send(statusCode, {
          error: errorMessage
        });
      }
    });
  });
  
  // Get notes
  app.get('/notes', (req, res) => {
    let token = req.header('x-access-token');

    NotesController.getNotes(token, (statusCode, errorMessage, notes) => {
      if (statusCode !== 200) {
        return res.send(statusCode, {
          error: errorMessage
        });
      }
      return res.send(200, {
        error: null,
        notes: notes
      });
    });
  });

  // Add note
  app.put('/notes', (req, res) => {
    let token = req.header('x-access-token');
    let noteContent = req.body.content || '';

    NotesController.addNote(token, noteContent, (statusCode, errorMessage, note) => {
      if (statusCode !== 200) {
        return res.send(statusCode, {
          error: errorMessage
        });
      }
      return res.send(200, {
        error: null,
        note: note
      });
    });
  });

  // Patch note
  app.patch('/notes/:id', (req,res) =>{
    let token = req.header('x-access-token');

    if(!token){
      return res.send(401, {
        error: "Utilisateur non connecté"
      });
    }

    jwt.verify(token, process.env.JWT_KEY, async (err,authUser) => {
      if(err){
        return res.send(401, {
          error: "Utilisateur non connecté"
        });
      }

      let noteID;
      try {
        noteID = new ObjectID(req.params.id);
      } catch(error) {
        console.error(error);
      }

      Notes.get(noteID, (error, note) => {
        if (error || !note) {
          return res.send(404, {
            error: 'Cet identifiant est inconnu'
          });
        }
        if (note.userId !== authUser._id) {
          return res.send(403, {
            error: 'Accès non autorisé à cette note'
          });
        }

        Notes.patch(note._id, req.body.content, (error, note) => {
          if (error || !note) {
            return res.send(500, 'Impossible de modifier la note');
          }
          return res.send(200, {
            error: null,
            note: note.value
          });
        });
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

      Notes.delete(note._id, (error) => {
        if (error) {
          return res.send(500, {
            error: 'Impossible de supprimer la note.'
          });
        } else {
          return res.send(200, {
            error: null
          });
        }
      });
    });
  });

  app.listen(process.env.PORT, function() {
    console.log(`App listening on PORT ${process.env.PORT}`);
  });
})();
