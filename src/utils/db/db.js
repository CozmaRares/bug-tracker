const crypto = require("crypto");

const user = require("./queries/user");
const project = require("./queries/project");
const ticket = require("./queries/ticket");
const shortComment = require("./queries/shortComment");
const longComment = require("./queries/longComment");

module.exports = {
  user,
  project,
  ticket,
  shortComment,
  longComment
};
