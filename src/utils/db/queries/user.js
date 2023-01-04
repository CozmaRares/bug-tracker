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

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        name: user.name
      })
    )
  );
}

function getAll(...columns) {
  const query = `
    SELECT ${columns.length == 0 ? "*" : columns.join(", ")}
    FROM User
    ORDER BY name
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getByEmail(email) {
  const query = `
    SELECT * 
    FROM User
    WHERE email = '${email}'
  `;

  return new Promise(resolve =>
    runQuery(query, data => {
      if (data.length) resolve(data[0]);
      else resolve(null);
    })
  );
}

function getByName(name) {
  const query = `
    SELECT * 
    FROM User
    WHERE name = '${name}'
  `;

  return new Promise(resolve =>
    runQuery(query, data => {
      if (data.length) resolve(data[0]);
      else resolve(null);
    })
  );
}

function updateRole(name, role) {
  const query = `
    UPDATE User
    SET role='${role}'
    WHERE name='${name}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getAssignedProjects(userName) {
  const query = `
    SELECT Project.*
    FROM Project
    JOIN ProjectDevHistory ON Project.id = ProjectDevHistory.projectID
    WHERE userName = '${userName}'
      AND leftAt IS NULL
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getManagedProjects(userName) {
  const query = `
    SELECT *
    FROM Project
    WHERE managerName = '${userName}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getAssignedTickets(userName) {
  const query = `
    SELECT Ticket.*
    FROM Ticket
    JOIN TicketAssignment ON Ticket.id = TicketAssignment.ticketID
    WHERE userName='${userName}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
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
