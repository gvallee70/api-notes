const jwt = require('jsonwebtoken');
require('dotenv').config();

const Notes = require('../models/notes');

const NotesController = {};

NotesController.getNotes = (token, callback) => {
  if (!token) {
    return callback(401, 'Utilisateur non connecté');
  }

  jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error || !decoded) {
      return callback(401, 'Utilisateur non connecté');
    }

    let userID = decoded._id;

    Notes.getAll(userID, (error, notes) => {
      if (error) {
        return callback(500, 'Impossible de récupérer la liste de notes');
      }
      return callback(200, null, notes);
    });
  });
};

module.exports = NotesController