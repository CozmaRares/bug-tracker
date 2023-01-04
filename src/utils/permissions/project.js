const { USER_ROLE } = require("../db/enums");
const db = require("../db/db");

async function canViewProject(user, project) {
  return (
    user.role === USER_ROLE.ADMIN ||
    project.managerName === user.name ||
    (await db.project.isDevAssigned(project.id, user.name))
  );
}

module.exports = {
  canViewProject
};
