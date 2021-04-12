module.exports = function (req, res, next) {
  // 401 unauthorized = when user doesn't send valid jwt, so we give them another chance to access the endpoint
  // 403 forbidden = even if you send a valid jwt, your role doesn't allow you to access a certain endpoint
  if (!req.user.isAdmin) return res.status(403).send("Access denied.");

  next();
};
