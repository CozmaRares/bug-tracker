const { hashPassword } = require("../../utils");
const { runQuery } = require("./runQuery");

function create(user) {
  const query = `
    INSERT INTO
    User(
        email, 
        password, 
        name
    )
    VALUES(
    '${user.email}',
    '${hashPassword(user.password)}',
    '${user.name}'
    );
  `;

  const data = runQuery(query);
  return {
    data,
    name: user.name
  };
}

function getAll(...columns) {
  const query = `
    SELECT ${columns.length == 0 ? "*" : columns.join(", ")}
    FROM User
    ORDER BY name
  `;

  return runQuery(query);
}

async function getByEmail(email) {
  const query = `
    SELECT * 
    FROM User
    WHERE email = '${email}'
  `;

  const data = await runQuery(query);
  return data.length ? data[0] : null;
}

async function getByName(name) {
  const query = `
    SELECT * 
    FROM User
    WHERE name = '${name}'
  `;

  const data = await runQuery(query);
  return data.length ? data[0] : null;
}

function updateRole(name, role) {
  const query = `
    UPDATE User
    SET role='${role}'
    WHERE name='${name}'
  `;

  return runQuery(query);
}

function getAssignedProjects(userName) {
  const query = `
    SELECT Project.*
    FROM Project
    JOIN ProjectDevHistory ON Project.id = ProjectDevHistory.projectID
    WHERE userName = '${userName}'
      AND leftAt IS NULL
  `;

  return runQuery(query);
}

function getManagedProjects(userName) {
  const query = `
    SELECT *
    FROM Project
    WHERE managerName = '${userName}'
  `;

  return runQuery(query);
}

function getAssignedTickets(userName) {
  const query = `
    SELECT Ticket.*
    FROM Ticket
    JOIN TicketAssignment ON Ticket.id = TicketAssignment.ticketID
    WHERE userName='${userName}'
  `;

  return runQuery(query);
}

module.exports = {
  create,
  getAll,
  getByName,
  getByEmail,
  updateRole,
  getAssignedProjects,
  getManagedProjects,
  getAssignedTickets
};
