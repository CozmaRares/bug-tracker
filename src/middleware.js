const db = require("./utils/db/db");
const { canViewProject } = require("./utils/permissions/project");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}

function userRole(...roles) {
  return (req, res, next) => {
    if (roles.indexOf(req.user.role) != -1) return next();
    res.status(401).redirect("/");
  };
}

async function setProject(req, res, next) {
  const id = req.params.projectID;

  req.project = await db.project.getById(id);

  if (req.project != null) return next();
  res.status(404).send("Project not found");
}

async function authGetProject(req, res, next) {
  const canView = await canViewProject(req.user, req.project);

  if (canView) return next();
  res.status(401).redirect("/");
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  userRole,
  setProject,
  authGetProject
};
