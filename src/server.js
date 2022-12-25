require("dotenv").config();

const express = require("express");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const crypto = require("crypto");
const methodOverride = require("method-override");

const { hashPassword } = require("./utils/bcrypt-wrapper");
const { checkAuthenticated, checkNotAuthenticated } = require("./middleware");

require("./passport-config")(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const port = 3000;
const app = express();
const users = [
  {
    id: crypto.randomUUID(),
    username: "a",
    email: "a@a",
    password: hashPassword("a"),
    role: "admin"
  }
];

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.post("/api/register", checkNotAuthenticated, (req, res) => {
  if (req.body.password != req.body.passwordConfirm) res.redirect("/register");

  const hashedPassword = hashPassword(req.body.password);

  try {
    users.push({
      id: crypto.randomUUID(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: "submitter"
    });
    res.redirect("/login");
    console.log(users);
  } catch {
    res.redirect("/register");
  }
});

app.post(
  "/api/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.delete("/api/logout", (req, res) => {
  req.logOut(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { username: req.user.username, role: req.user.role });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.all("*", (req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
});

app.listen(port, error => {
  console.log(error ? error : "Server listening on http://localhost:" + port);
});
