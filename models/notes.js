const database = require('../database');

const Notes = {};

// Get notes
Notes.get = (userID, callback) => {
  const notesCollection = database.db.collection('notes');
  notesCollection.find({ userId: userID }).toArray(callback);
};

// Add note
Notes.add = (content, userID, callback) => {
  const note = {
    content: content,
    userId: userID,
    createdAt: new Date(),
    lastUpdatedAt: null
  };

  const notesCollection = database.db.collection('notes');
  notesCollection.insertOne(note, (error, addedNote) => {
    callback(error, {
      _id: addedNote.insertedId,
      ...note
    })
  });
};

// Delete note
Notes.delete = (noteID, callback) => {
  const notesCollection = database.db.collection('notes');
  notesCollection.deleteOne({ _id: noteID }, callback);
};

module.exports = Notes;
