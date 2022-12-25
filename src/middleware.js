const db = require("./utils/db/data");
const { canViewProject } = require("./utils/permissions/project");

function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/");
  next();
}

function userRole(role) {
  return (req, res, next) => {
    if (req.user.role != role) return res.status(401).send("Not allowed");

    next();
  };
}

function setProject(req, res, next) {
  const id = parseInt(req.params.projectId);

  req.project = db.projects.getProjectById(id);

  if (req.project == null) return res.status(404).send("Project not found");

  next();
}

function authGetProject(req, res, next) {
  if (!canViewProject(req.user, req.project))
    return res.status(401).send("Not allowed");

  next();
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  userRole,
  setProject,
  authGetProject
};
