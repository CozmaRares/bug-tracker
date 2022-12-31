const { hashPassword } = require("../../utils");
const { runQuery } = require("../runQuery");

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
        email: user.email
      })
    )
  );
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

function updateRole(email, role) {
  const query = `
    UPDATE User
    SET role='${role}'
    WHERE email='${email}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getAssignedProjects(userEmail) {
  const query = `
    SELECT Project.*, User.name managerUserName
    FROM Project
    JOIN ProjectDevHistory ON Project.id = ProjectDevHistory.projectID
    JOIN User ON Project.managerEmail = User.email
    WHERE userEmail = '${userEmail}'
      AND leftAt IS NULL
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getManagedProjects(userEmail) {
  const query = `
    SELECT Project.*, User.name managerUserName
    FROM Project
    JOIN User ON Project.managerEmail = User.email
    WHERE managerEmail = '${userEmail}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getAssignedTickets(userEmail) {
  const query = `
    SELECT Ticket.*
    FROM Ticket
    JOIN TicketAssignment ON Ticket.id = TicketAssignment.ticketID
    WHERE userEmail='${userEmail}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

module.exports = {
  create,
  getByEmail,
  updateRole,
  getAssignedProjects,
  getManagedProjects,
  getAssignedTickets
};
