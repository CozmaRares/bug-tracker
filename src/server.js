const express = require("express");
const path = require("path");

const port = 3000;
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "..", "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.all("*", (req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
});

app.listen(port, error => {
  console.log(error ? error : "Server listening on http://localhost:" + port);
});
