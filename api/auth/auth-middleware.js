const Users = require('./auth-model');

const validatePayload = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(404).json({
      message: 'username and password required',
    });
    return;
  }
  next();
};

const validateUsername = (req, res, next) => {
  const { username } = req.body;
  Users.getByUsername(username).then((user) => {
    if (user) {
      res.status(404).json({
        message: 'username taken',
      });
      return;
    }
    next();
  });
};

module.exports = { validatePayload, validateUsername };
