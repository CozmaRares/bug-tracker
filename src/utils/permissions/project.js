const { USER_ROLE } = require("../db/enums");
const db = require("../db/db");

async function canViewProject(user, project) {
  return (
    user.role === USER_ROLE.ADMIN ||
    project.managerEmail === user.email ||
    (await db.project.isUserAssigned(project.id, user.email))
  );
}

module.exports = {
  canViewProject
};
