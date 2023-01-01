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

module.exports = { validatePayload };
