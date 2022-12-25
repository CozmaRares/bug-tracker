const { USER_ROLE } = require("../db/enums");

function canViewProject(user, project) {
  return user.role === USER_ROLE.ADMIN || project.userEmail === user.email;
}

module.exports = {
  canViewProject
};
