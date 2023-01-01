const db = require('../../data/dbConfig');

const getAll = () => {
  return db('users');
};

const getByUsername = (username) => {
  return db('users').where({ username }).first();
};

const insert = (user) => {
  return db('users').insert(user);
};

module.exports = { getAll, insert, getByUsername };
