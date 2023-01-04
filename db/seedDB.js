const fs = require("fs");
const path = require("path");

const { endConnection } = require("../src/utils/db/queries/runQuery");
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
    name: "dev1"
  },
  {
    email: "dev2@dev2",
    password: "dev2",
    name: "dev2"
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
    name: "admin",
    role: dbEnums.USER_ROLE.ADMIN
  },
  {
    name: "manager",
    role: dbEnums.USER_ROLE.MANAGER
  },
  {
    name: "dev1",
    role: dbEnums.USER_ROLE.DEVELOPER
  },
  {
    name: "dev2",
    role: dbEnums.USER_ROLE.DEVELOPER
  },
  {
    name: "a",
    role: dbEnums.USER_ROLE.ADMIN
  }
];

const projects = [
  {
    name: "Bug Tracker",
    managerName: "manager",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "projects", "bug_tracker.md")
    )
  },
  {
    name: "Virtual Assistant Raspberry Pi",
    managerName: "manager",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "projects", "tts.md")
    )
  }
];

const projectUpdates = [
  {
    project: projects[0],
    status: dbEnums.PROJECT_STATUS.DEVELOPMENT,
    managerName: "admin"
  },
  {
    project: projects[1],
    status: dbEnums.PROJECT_STATUS.PRODUCTION
  }
];

const projectDevs = [
  {
    userName: "manager",
    project: projects[0]
  },
  {
    userName: "dev1",
    project: projects[0]
  },
  {
    userName: "dev2",
    project: projects[1]
  },
  {
    userName: "admin",
    project: projects[0]
  }
];

const projectDevMoves = [
  {
    userName: "manager",
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
    authorName: "submitter"
  },
  {
    type: dbEnums.TICKET_TYPE.BUG,
    title: "Wrong HTTP response status codes",
    description: fs.readFileSync(
      path.join(__dirname, "descriptions", "posts", "responses.md")
    ),
    project: projects[0],
    authorName: "admin"
  }
];

const ticketAssignments = [
  {
    userName: "admin",
    ticket: tickets[0]
  },
  {
    userName: "dev1",
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
    authorName: "admin",
    ticket: tickets[0]
  },
  {
    content: "Ticket completed",
    authorName: "admin",
    ticket: tickets[0]
  },
  {
    content: "Ticket assigned to admin",
    authorName: "admin",
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
    const promise = db.user.updateRole(update.name, update.role);
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

    if (update.managerName)
      promises.push(db.project.updateManager(id, update.managerName));
  });

  return Promise.all(promises);
}

function createProjectDevHistory() {
  const promises = [];

  projectDevs.forEach(async entry => {
    promises.push(db.project.addDev(entry.userName, entry.project.id));
  });

  return Promise.all(promises);
}

function updateProjectDevHistory() {
  const promises = [];

  projectDevMoves.forEach(update => {
    promises.push(
      db.project.moveDev(
        update.userName,
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
    promises.push(db.ticket.assign(entry.ticket.id, entry.userName));
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
