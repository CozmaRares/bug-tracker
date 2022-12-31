const db = require("./utils/db/db");
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

async function setProject(req, res, next) {
  const id = req.params.projectID;

  req.project = await db.project.getById(id);

  if (req.project == null) return res.status(404).send("Project not found");

  next();
}

async function authGetProject(req, res, next) {
  const canView = await canViewProject(req.user, req.project);

  if (!canView) return res.status(401).redirect("/");

  next();
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  userRole,
  setProject,
  authGetProject
};
