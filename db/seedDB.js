const fs = require("fs");
const path = require("path");

const { endConnection } = require("../src/utils/db/runQuery");
const dbEnums = require("../src/utils/db/enums");
const db = require("../src/utils/db/db");

const users = [
  {
    email: "admin@admin",
    password: "admin",
    name: "admin"
  },
  {
    email: "manager@manager",
    password: "manager",
    name: "manager"
  },
  {
    email: "dev1@dev1",
    password: "dev1",
    name: "developer1"
  },
  {
    email: "dev2@dev2",
    password: "dev2",
    name: "developer2"
  },
  {
    email: "submitter@submitter",
    password: "submitter",
    name: "submitter"
  },
  {
    email: "a@a",
    password: "a",
    name: "a"
  }
];

const userRoleUpdates = [
  {
    email: "admin@admin",
    role: dbEnums.USER_ROLE.ADMIN
  },
  {
    email: "manager@manager",
    role: dbEnums.USER_ROLE.MANAGER
  },
  {
    email: "dev1@dev1",
    role: dbEnums.USER_ROLE.DEVELOPER
  },
  {
    email: "dev2@dev2",
    role: dbEnums.USER_ROLE.DEVELOPER
  },
  {
    email: "a@a",
    role: dbEnums.USER_ROLE.ADMIN
  }
];

const projects = [
  {
    name: "Bug Tracker",
    managerEmail: "manager@manager",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "projects", "bug_tracker.md")
    )
  },
  {
    name: "Virtual Assistant Raspberry Pi",
    managerEmail: "manager@manager",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "projects", "tts.md")
    )
  }
];

const projectUpdates = [
  {
    project: projects[0],
    status: dbEnums.PROJECT_STATUS.DEVELOPMENT,
    managerEmail: "admin@admin"
  },
  {
    project: projects[1],
    status: dbEnums.PROJECT_STATUS.PRODUCTION
  }
];

const projectDevs = [
  {
    userEmail: "manager@manager",
    project: projects[0]
  },
  {
    userEmail: "dev1@dev1",
    project: projects[0]
  },
  {
    userEmail: "dev2@dev2",
    project: projects[1]
  },
  {
    userEmail: "admin@admin",
    project: projects[0]
  }
];

const projectDevMoves = [
  {
    userEmail: "manager@manager",
    oldProject: projects[0],
    newProject: projects[1]
  }
];

const tickets = [
  {
    type: dbEnums.TICKET_TYPE.BUG,
    title: "Important pages not coded",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "posts", "pages.md")
    ),
    project: projects[0],
    authorEmail: "submitter@submitter"
  },
  {
    type: dbEnums.TICKET_TYPE.BUG,
    title: "Wrong HTTP response status codes",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "posts", "responses.md")
    ),
    project: projects[0],
    authorEmail: "admin@admin"
  }
];

const ticketAssignments = [
  {
    userEmail: "admin@admin",
    ticket: tickets[0]
  },
  {
    userEmail: "dev1@dev1",
    ticket: tickets[1]
  }
];

const ticketUpdates = [
  {
    ticket: tickets[0],
    status: dbEnums.TICKET_STATUS.ASSIGNED,
    priority: dbEnums.TICKET_PRIORITY.HIGH
  },
  {
    ticket: tickets[1],
    status: dbEnums.TICKET_STATUS.COMPLETED,
    priority: dbEnums.TICKET_PRIORITY.LOW
  }
];

const shortComments = [
  {
    content: "Ticket assigned to dev1",
    authorEmail: "admin@admin",
    ticket: tickets[0]
  },
  {
    content: "Ticket completed",
    authorEmail: "admin@admin",
    ticket: tickets[0]
  },
  {
    content: "Ticket assigned to admin",
    authorEmail: "admin@admin",
    ticket: tickets[1]
  }
];

function createUsers() {
  const promises = [];

  users.forEach(async user => {
    const promise = db.user.create(user);
    promises.push(promise);
  });

  return Promise.all(promises);
}

function updateUserRoles() {
  const promises = [];

  userRoleUpdates.forEach(update => {
    const promise = db.user.updateRole(update.email, update.role);
    promises.push(promise);
  });

  return Promise.all(promises);
}

function createProjects() {
  const promises = [];

  projects.forEach(async project => {
    const promise = db.project.create(project);
    promises.push(promise);

    const { id } = await promise;
    project.id = id;
  });

  return Promise.all(promises);
}

function updateProjects() {
  const promises = [];

  projectUpdates.forEach(update => {
    const id = update.project.id;

    if (update.status)
      promises.push(db.project.updateStatus(id, update.status));

    if (update.managerEmail)
      promises.push(db.project.updateManager(id, update.managerEmail));
  });

  return Promise.all(promises);
}

function createProjectDevHistory() {
  const promises = [];

  projectDevs.forEach(async entry => {
    promises.push(db.project.addDev(entry.userEmail, entry.project.id));
  });

  return Promise.all(promises);
}

function updateProjectDevHistory() {
  const promises = [];

  projectDevMoves.forEach(update => {
    promises.push(
      db.project.moveDev(
        update.userEmail,
        update.oldProject.id,
        update.newProject.id
      )
    );
  });

  return Promise.all(promises);
}

function createTickets() {
  const promises = [];

  tickets.forEach(async ticket => {
    const promise = db.ticket.create({
      ...ticket,
      projectID: ticket.project.id
    });
    promises.push(promise);

    const { id } = await promise;
    ticket.id = id;
  });

  return Promise.all(promises);
}

function createTicketAssignments() {
  const promises = [];

  ticketAssignments.forEach(entry => {
    promises.push(db.ticket.assign(entry.ticket.id, entry.userEmail));
  });

  return Promise.all(promises);
}

function updateTickets() {
  const promises = [];

  ticketUpdates.forEach(update => {
    const id = update.ticket.id;

    if (update.status) promises.push(db.ticket.updateStatus(id, update.status));

    if (update.priority)
      promises.push(db.ticket.updatePriority(id, update.priority));
  });

  return Promise.all(promises);
}

function createShortComments() {
  const promises = [];

  shortComments.forEach(comment => {
    promises.push(
      db.shortComment.create({
        ...comment,
        ticketID: comment.ticket.id
      })
    );
  });

  return Promise.all(promises);
}

async function seedDB() {
  await createUsers();
  await updateUserRoles();
  await createProjects();
  await updateProjects();
  await createProjectDevHistory();
  await updateProjectDevHistory();
  await createTickets();
  await createTicketAssignments();
  await updateTickets();
  await createShortComments();
  endConnection();
}

seedDB();
