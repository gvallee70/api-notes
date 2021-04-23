const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const database = require('../database');

const User = {};

// Sign up
User.signup = (username, password, callback) => {
  User.checkUsername(username, (error) => {
    if (error) {
      return callback(400, error);
    }
  });
  User.checkPassword(password, (error) => {
    if (error) {
      return callback(400, error);
    }
  });

  const usersCollection = database.db.collection('users');

  if (usersCollection.find({username}).toArray().length > 0) {
    return callback(400, 'Cet identifiant est déjà associé à un compte');
  }

  const user = {
    username: username,
    password: bcrypt.hashSync(password, 10)
  };

  usersCollection.insertOne(user);

  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '24h'
  });

  return callback(200, null, token);
};

// Sign in
User.signin = (username, password, callback) => {
  User.checkUsername(username, (error) => {
    if (error) {
      return callback(400, error);
    }
  });
  User.checkPassword(password, (error) => {
    if (error) {
      return callback(400, error);
    }
  });

  const usersCollection = database.db.collection('users');

  usersCollection.findOne({ username }, (error, user) => {
    if (error || !user) {
      return callback(403, 'Cet identifiant est inconnu');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return callback(400, 'Mot de passe invalide');
    }

    let token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: '24h'
    });
    return callback(200, null, token);
  });
};

User.checkUsername = (username, callback) => {
  if (username.length < 2 || username.length > 20) {
    return callback('Votre identifiant doit contenir entre 2 et 20 caractères');
  }
  if (!(/^[a-z]+$/.test(username))) {
    return callback('Votre identifiant ne doit contenir que des lettres minuscules non accentuées');
  }
  return callback(null);
};

User.checkPassword = (password, callback) => {
  if (password.length < 4) {
    return callback('Le mot de passe doit contenir au moins 4 caractères');
  }
  return callback(null);
};

module.exports = User;
