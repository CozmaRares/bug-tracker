const crypto = require("crypto");
const { hashPassword } = require("../../utils/bcrypt-wrapper");
const dbEnums = require("./enums");

const users = [
  {
    username: "a",
    email: "a@a",
    password: hashPassword("a"),
    role: dbEnums.USER_ROLE.ADMIN
  }
];

function addUser(username, email, password, role) {
  users.push({ username, email, password, role });
}

function getUserByEmail(email) {
  return users.find(user => user.email === email);
}

const projects = [
  {
    id: crypto.randomUUID(),
    name: "Bug Tracker",
    status: dbEnums.PROJECT_STATUS.DEVELOPMENT,
    description: "Bug Tracker"
  }
];

function addProject(id, name, status, description) {
  projects.push({ id, name, status, description });
}

function getProjectById(id) {
  return projects.find(project => project.id === id);
}

module.exports = {
  users: {
    addUser,
    getUserByEmail
  },
  projects: {
    addProject,
    getProjectById
  }
};
