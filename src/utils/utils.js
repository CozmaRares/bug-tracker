const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

function createDescriptionFile(contents) {
  const uuid = crypto.randomUUID();

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "descriptions",
    `${uuid}.md`
  );

  fs.writeFileSync(filePath, contents);

  return uuid;
}

module.exports = {
  hashPassword,
  comparePassword,
  createDescriptionFile
};
