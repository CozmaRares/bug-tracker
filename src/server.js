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
  authGetProject,
  userRole
} = require("./middleware");
const db = require("./utils/db/db");
const dbEnums = require("./utils/db/enums");

require("./passport-config")(passport, db.user.getByEmail);

const port = 3000;
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "..", "public")));
app.use(express.json());
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

  delete ticketsData.status[dbEnums.TICKET_STATUS.COMPLETED];

  tickets.forEach(ticket => {
    if (ticket.status == dbEnums.TICKET_STATUS.COMPLETED) return;

    ticketsData.priority[ticket.priority]++;
    ticketsData.status[ticket.status]++;
  });

  projects.forEach(project => {
    project.createdAt = project.createdAt.toLocaleDateString();
  });

  res.render("index", {
    projects,
    ticketsData,
    username: req.user.name,
    role: req.user.role,
    USER_ROLE: dbEnums.USER_ROLE
  });
});

app.delete("/logout", (req, res) => {
  req.logOut(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.get(
  "/manage-users",
  userRole(dbEnums.USER_ROLE.ADMIN),
  async (req, res) => {
    const users = await db.user.getAll();
    const SELECT_ROLES = { ...dbEnums.USER_ROLE };

    delete SELECT_ROLES[dbEnums.USER_ROLE.ADMIN];

    res.render("manage-users", {
      users: users.filter(user => user.role != dbEnums.USER_ROLE.ADMIN),
      username: req.user.name,
      role: req.user.role,
      USER_ROLE: dbEnums.USER_ROLE,
      SELECT_ROLES
    });
  }
);

app.post(
  "/update-role",
  userRole(dbEnums.USER_ROLE.ADMIN),
  async (req, res) => {
    await db.user.updateRole(req.body.userEmail, req.body.role);

    res.status(204).send();
  }
);

app.get("/project/:projectID", setProject, authGetProject, (req, res) => {
  res.send(req.project);
});

app.all("*", (req, res) => {
  res.status(404).redirect("/");
});

app.listen(port, error => {
  console.log(error ? error : "Server listening on http://localhost:" + port);
});
