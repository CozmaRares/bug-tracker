const crypto = require("crypto");

const { TICKET_STATUS } = require("../enums");
const { createDescriptionFile } = require("../../utils");
const { runQuery } = require("./runQuery");

function create(ticket) {
  const descriptionFileID = createDescriptionFile(ticket.description);
  const id = crypto.randomUUID();

  const query = `
      INSERT INTO
       Ticket(
          id,
          type,
          title,
          descriptionFileID,
          projectID,
          authorEmail
        )
      VALUES(
        '${id}',
        '${ticket.type}',
        '${ticket.title}',
        '${descriptionFileID}',
        '${ticket.projectID}',
        '${ticket.authorEmail}'
      )
    `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        id
      })
    )
  );
}

function getAll() {
  const query = `
    SELECT *
    FROM Ticket
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function updateType(id, type) {
  const query = `
      UPDATE Ticket
      SET type='${type}', 
        updatedAt=CURRENT_DATE
      WHERE id='${id}'
    `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function updateStatus(id, status) {
  const query = `
      UPDATE Ticket
      SET status='${status}', 
        updatedAt=CURRENT_DATE
      WHERE id='${id}'
    `;

  if (status === TICKET_STATUS.COMPLETED) await updateTicketAssignmentEntry(id);

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function updatePriority(id, priority) {
  const query = `
        UPDATE Ticket
        SET priority='${priority}', 
          updatedAt=CURRENT_DATE
        WHERE id='${id}'
    `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function assign(ticketID, ...userEmails) {
  const promises = [];

  userEmails.forEach(userEmail =>
    promises.push(
      createTicketAssignmentEntry({
        ticketID: ticketID,
        userEmail: userEmail
      })
    )
  );

  return Promise.all(promises);
}

function createTicketAssignmentEntry(entry) {
  const query = `
      INSERT INTO
        TicketAssignment(
          userEmail,
          ticketID
        )
      VALUES(
        '${entry.userEmail}',
        '${entry.ticketID}'
      )
    `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        userEmail: entry.userEmail,
        ticketID: entry.ticketID
      })
    )
  );
}

function updateTicketAssignmentEntry(ticketID) {
  const query = `
      UPDATE TicketAssignment
      SET completedAt=CURRENT_DATE
      WHERE ticketID='${ticketID}'
    `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

module.exports = {
  create,
  getAll,
  updateType,
  updateStatus,
  updatePriority,
  assign
};
