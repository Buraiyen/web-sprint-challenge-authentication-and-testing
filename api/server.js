const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const restrict = require('./middleware/restricted.js');

const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();
const session = require('express-session');

const sessionConfig = {
  name: 'cookie', // default would the the cookie id
  secret: 'keep it secret', // should be saved in an environment variable
  cookie: {
    maxAge: 1000 * 30, // valid for 30 seconds
    secure: false, // should be true in production
    httpOnly: true, // cannot be accessed from javascript
  },
  resave: false, // 'do we want to recreate a session even if it hasne't changed?'
  saveUnintialized: false, // GDPR laws agaisnst setting cookies automatically. User should opt in
};

server.use(session(sessionConfig));
server.use(helmet());
server.use(cors());
server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/jokes', restrict, jokesRouter); // only logged-in users should have access!

module.exports = server;
