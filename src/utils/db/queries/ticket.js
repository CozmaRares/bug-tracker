const crypto = require("crypto");

const { TICKET_STATUS } = require("../enums");
const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");

function create(ticket) {
  const descriptionFileID = createMarkdownFile(ticket.description);
  const id = crypto.randomUUID();

  const query = `
      INSERT INTO
       Ticket(
          id,
          type,
          title,
          descriptionFileID,
          projectID,
          authorName
        )
      VALUES(
        '${id}',
        '${ticket.type}',
        '${ticket.title}',
        '${descriptionFileID}',
        '${ticket.projectID}',
        '${ticket.authorName}'
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

function getAll(...columns) {
  const query = `
    SELECT ${columns.length == 0 ? "*" : columns.join(", ")}
    FROM Ticket
    ORDER BY title
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function updateType(id, type) {
  const query = `
      UPDATE Ticket
      SET type='${type}'
      WHERE id='${id}'
    `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function updateStatus(id, status) {
  const query = `
      UPDATE Ticket
      SET status='${status}'
      WHERE id='${id}'
    `;

  if (status === TICKET_STATUS.COMPLETED) await updateTicketAssignmentEntry(id);

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function updatePriority(id, priority) {
  const query = `
        UPDATE Ticket
        SET priority='${priority}'
        WHERE id='${id}'
    `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function assign(ticketID, ...userNames) {
  const promises = [];

  userNames.forEach(userName =>
    promises.push(
      createTicketAssignmentEntry({
        ticketID: ticketID,
        userName: userName
      })
    )
  );

  return Promise.all(promises);
}

function createTicketAssignmentEntry(entry) {
  const query = `
      INSERT INTO
        TicketAssignment(
          userName,
          ticketID
        )
      VALUES(
        '${entry.userName}',
        '${entry.ticketID}'
      )
    `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        userName: entry.userName,
        ticketID: entry.ticketID
      })
    )
  );
}

function updateTicketAssignmentEntry(ticketID) {
  const query = `
      UPDATE TicketAssignment
      SET completedAt=CURRENT_TIMESTAMP
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
