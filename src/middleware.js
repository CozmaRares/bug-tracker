function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/");
  next();
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
};
