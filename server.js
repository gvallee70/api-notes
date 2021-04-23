const restify = require('restify');

const database = require('./database');
const User = require('./models/user');
const NotesController = require('./controllers/notes-controller');

require('dotenv').config();

const app = restify.createServer();

(async () => {
  await database.connect();

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
    const token = req.header('x-access-token');

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
    const token = req.header('x-access-token');
    const noteContent = req.body.content || '';

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
    const token = req.header('x-access-token');
    const noteID = req.params.id;
    const noteContent = req.body.content;

    NotesController.modifyNote(token, noteID, noteContent, (statusCode, errorMessage, note) => {
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

  // Delete note
  app.del('/notes/:id', (req, res) => {
    const token = req.header('x-access-token');
    const noteID = req.params.id;

    NotesController.deleteNote(token, noteID, (statusCode, errorMessage) => {
      return res.send(statusCode, {
        error: errorMessage
      })
    });
  });

  app.listen(process.env.PORT, function() {
    console.log(`App listening on PORT ${process.env.PORT}`);
  });
})();
