const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Users = require('../models/users');

const database = require('../database');

const UserController = {};

// Sign up
UserController.signup = (username, password, callback) => {
  if (!username || !password) {
    return callback(400, 'Saisissez un identifiant et un mot de passe');
  }

  checkUsername(username, (error) => {
    if (error) {
      return callback(400, error);
    }
  });
  checkPassword(password, (error) => {
    if (error) {
      return callback(400, error);
    }
  });

  // TODO
  // Users.getByUsername(username, (error, user) => {
  //   if (user) {
  //     return callback(400, 'Cet identifiant est déjà associé à un compte');
  //   }
  // });

  const user = {
    username: username,
    password: bcrypt.hashSync(password, 10)
  };

  Users.insert(user);

  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '24h'
  });

  return callback(200, null, token);
};

// Sign in
UserController.signin = (username, password, callback) => {
  if (!username || !password) {
    return callback(400, 'Saisissez un identifiant et un mot de passe');
  }

  checkUsername(username, (error) => {
    if (error) {
      return callback(400, error);
    }
  });
  checkPassword(password, (error) => {
    if (error) {
      return callback(400, error);
    }
  });

  const usersCollection = database.db.collection('users');

  usersCollection.findOne({ username }, (error, user) => { // TODO - To be replaced with the same method used line 29 (when it will be fixed)
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

checkUsername = (username, callback) => {
  if (username.length < 2 || username.length > 20) {
    return callback('Votre identifiant doit contenir entre 2 et 20 caractères');
  }
  if (!(/^[a-z]+$/.test(username))) {
    return callback('Votre identifiant ne doit contenir que des lettres minuscules non accentuées');
  }
  return callback(null);
};

checkPassword = (password, callback) => {
  if (password.length < 4) {
    return callback('Le mot de passe doit contenir au moins 4 caractères');
  }
  return callback(null);
};

module.exports = UserController;
