require("dotenv").config();

const express = require("express");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const {
  hashPassword,
  formatDates,
  updateMarkdownFile,
  loadMarkdownFile
} = require("./utils/utils");
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
      projectPromise = db.user.getAssignedProjects(req.user.name);
      ticketPromise = db.user.getAssignedTickets(req.user.name);
      break;
    case dbEnums.USER_ROLE.MANAGER:
      projectPromise = db.user.getManagedProjects(req.user.name);
      ticketPromise = db.project.getTickets(req.user.name);
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

  res.render("index", {
    projects: projects.map(formatDates),
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
  "/update-user-role",
  userRole(dbEnums.USER_ROLE.ADMIN),
  async (req, res) => {
    await db.user.updateRole(req.body.userName, req.body.role);

    res.status(204).send();
  }
);

app.get(
  "/manage-projects",
  userRole(dbEnums.USER_ROLE.MANAGER, dbEnums.USER_ROLE.ADMIN),
  async (req, res) => {
    const projects = await db.project.getAll(
      "id",
      "name",
      "status",
      "managerName",
      "createdAt"
    );

    const promises = [];

    projects.forEach(async project => {
      const promise = db.project
        .getAssignedDevs(project.id)
        .then(data => (project.assignedDevs = data.map(dev => dev.name)))
        .catch(err => {
          throw err;
        });

      promises.push(promise);
    });

    const users = await db.user.getAll("name", "role");

    await Promise.all(promises);

    res.render("manage-projects", {
      projects: projects.map(formatDates),
      username: req.user.name,
      role: req.user.role,
      USER_ROLE: dbEnums.USER_ROLE,
      PROJECT_STATUS: dbEnums.PROJECT_STATUS,
      devs: users
        .filter(user => user.role != dbEnums.USER_ROLE.SUBMITTER)
        .map(user => user.name),
      managers: users
        .filter(
          user =>
            user.role == dbEnums.USER_ROLE.MANAGER ||
            user.role == dbEnums.USER_ROLE.ADMIN
        )
        .map(user => user.name)
    });
  }
);

app.post(
  "/modify-project",
  userRole(dbEnums.USER_ROLE.MANAGER, dbEnums.USER_ROLE.ADMIN),
  async (req, res) => {
    const [project, assignedDevs] = await Promise.all([
      db.project.getById(req.body.id),
      db.project
        .getAssignedDevs(req.body.id)
        .then(devs => devs.map(dev => dev.name))
    ]);

    const newManager = req.body.managerName;
    const newDevs = req.body.assignedDevs;

    const promises = [];

    if (req.body.name != project.name)
      promises.push(db.project.updateName(project.id, req.body.name));

    if (newManager != project.managerName)
      promises.push(db.project.updateManager(project.id, newManager));

    if (req.body.status != project.status)
      promises.push(db.project.updateStatus(project.id, req.body.status));

    assignedDevs.forEach(dev => {
      if (newDevs.indexOf(dev) == -1)
        promises.push(db.project.removeDev(dev, project.id));
    });

    newDevs.forEach(dev => {
      if (assignedDevs.indexOf(dev) == -1)
        promises.push(db.project.addDev(dev, project.id));
    });

    updateMarkdownFile(project.descriptionFileID, req.body.description);

    await Promise.all(promises);

    res.status(204).send();
  }
);

app.get("/project/:projectID", setProject, authGetProject, (req, res) => {
  res.json(req.project);
});

app.get(
  "/project/description/:projectID",
  setProject,
  authGetProject,
  async (req, res) => {
    const description = await loadMarkdownFile(req.project.descriptionFileID);

    res.json({ description });
  }
);

app.all("*", (req, res) => {
  res.status(404).redirect("/");
});

app.listen(port, error => {
  console.log(error ? error : "Server listening on http://localhost:" + port);
});
