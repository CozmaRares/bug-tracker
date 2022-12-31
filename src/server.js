require("dotenv").config();

const express = require("express");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const { hashPassword } = require("./utils/utils");
const {
  checkAuthenticated,
  checkNotAuthenticated,
  setProject,
  authGetProject
} = require("./middleware");
const db = require("./utils/db/db");
const dbEnums = require("./utils/db/enums");

require("./passport-config")(passport, db.user.getByEmail);

const port = 3000;
const app = express();

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

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.post("/register", checkNotAuthenticated, (req, res) => {
  if (req.body.password != req.body.passwordConfirm) {
    req.flash("error", "passwords");
    req.flash("email", req.body.email);
    req.flash("username", req.body.username);
    return res.redirect("/register");
  }

  const hashedPassword = hashPassword(req.body.password);

  try {
    db.user.add({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: dbEnums.USER_ROLE.SUBMITTER
    });
    res.redirect("/login");
  } catch {
    req.flash("error", "email");
    req.flash("username", req.body.username);
    res.redirect("/register");
  }
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.use(checkAuthenticated);

app.get("/", async (req, res) => {
  let projectPromise;
  let ticketPromise;

  switch (req.user.role) {
    case dbEnums.USER_ROLE.DEVELOPER:
      projectPromise = db.user.getAssignedProjects(req.user.email);
      ticketPromise = db.user.getAssignedTickets(req.user.email);
      break;
    case dbEnums.USER_ROLE.MANAGER:
      projectPromise = db.user.getManagedProjects(req.user.email);
      ticketPromise = db.project.getTickets(req.user.email);
      break;
    case dbEnums.USER_ROLE.ADMIN:
      projectPromise = db.project.getAll();
      ticketPromise = db.ticket.getAll();
      break;
  }

  const projects = await projectPromise;
  const tickets = await ticketPromise;

  const ticketsData = {
    priority: {},
    status: {}
  };

  Object.keys(dbEnums.TICKET_PRIORITY).forEach(
    key => (ticketsData.priority[key] = 0)
  );

  Object.keys(dbEnums.TICKET_STATUS).forEach(
    key => (ticketsData.status[key] = 0)
  );

  tickets.forEach(ticket => {
    ticketsData.priority[ticket.priority]++;
    ticketsData.status[ticket.status]++;
  });

  delete ticketsData.status[dbEnums.TICKET_STATUS.COMPLETED];

  projects.forEach(project => {
    project.createdAt = project.createdAt.toLocaleDateString();
  });

  res.render("index", {
    projects,
    ticketsData,
    username: req.user.name,
    role: req.user.role
  });
});

app.delete("/logout", (req, res) => {
  req.logOut(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.get("/project/:projectID", setProject, authGetProject, (req, res) => {
  res.send(req.project);
});

app.all("*", (req, res) => {
  res.status(404).redirect("/");
});

app.listen(port, error => {
  console.log(error ? error : "Server listening on http://localhost:" + port);
});
