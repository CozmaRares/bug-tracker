const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { marked } = require("marked");
const { JSDOM } = require("jsdom");
const dompurify = require("dompurify")(new JSDOM().window);

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

function updateMarkdownFile(uuid, markdown) {
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "descriptions",
    `${uuid}.md`
  );

  fs.writeFileSync(filePath, markdown);
}

function createMarkdownFile(markdown) {
  const uuid = crypto.randomUUID();

  updateMarkdownFile(uuid, markdown);

  return uuid;
}

function loadMarkdownFile(uuid) {
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "descriptions",
    `${uuid}.md`
  );

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) return reject(err);

      resolve(data);
    });
  });
}

async function loadParsedMarkdownFile(uuid) {
  const data = await loadMarkdownFile(uuid);

  return dompurify.sanitize(marked.parse(data));
}

function dateToString(date) {
  return date.toLocaleDateString("ro-RO").replaceAll(".", "/");
}

function formatDates(obj) {
  const newObj = { ...obj };

  Object.entries(obj).forEach(([key, value]) => {
    if (obj[key] instanceof Date) newObj[key] = dateToString(value);
  });

  return newObj;
}

function getValuesFromObject(obj) {
  return Object.entries(obj).map(([_, value]) => value);
}

module.exports = {
  hashPassword,
  comparePassword,
  createMarkdownFile,
  loadMarkdownFile,
  loadParsedMarkdownFile,
  updateMarkdownFile,
  dateToString,
  formatDates,
  getValuesFromObject
};
