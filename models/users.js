const database = require('../database');

const Users = {};

// Get user
Users.getByUsername = (username, callback) => {
  const usersCollection = database.db.collection('users');

  usersCollection.find({
    username: username
  }).toArray((error, users) => {
    if (users[0]) {
      return callback(error, users[0]);
    } else {
      return callback(error);
    }
  });
}

// Insert user
Users.insert = (user) => {
  const usersCollection = database.db.collection('users');
  usersCollection.insertOne(user);
};

module.exports = Users