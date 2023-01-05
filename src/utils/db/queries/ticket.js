const crypto = require("crypto");

const { TICKET_STATUS } = require("../enums");
const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");

async function create(ticket) {
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

  const data = await runQuery(query);
  return { data, id };
}

function getAll(...columns) {
  const query = `
    SELECT ${columns.length == 0 ? "*" : columns.join(", ")}
    FROM Ticket
    ORDER BY title
  `;

  return runQuery(query);
}

function updateType(id, type) {
  const query = `
      UPDATE Ticket
      SET type='${type}'
      WHERE id='${id}'
    `;

  return runQuery(query);
}

async function updateStatus(id, status) {
  const query = `
      UPDATE Ticket
      SET status='${status}'
      WHERE id='${id}'
    `;

  if (status === TICKET_STATUS.COMPLETED) await updateTicketAssignmentEntry(id);

  return runQuery(query);
}

function updatePriority(id, priority) {
  const query = `
        UPDATE Ticket
        SET priority='${priority}'
        WHERE id='${id}'
    `;

  return runQuery(query);
}

async function assign(ticketID, userName) {
  const query = `
      INSERT INTO
        TicketAssignment(
          userName,
          ticketID
        )
      VALUES(
        '${userName}',
        '${ticketID}'
      )
    `;

  const data = await runQuery(query);
  return { data, userName: userName, ticketID: ticketID };
}

function updateTicketAssignmentEntry(ticketID) {
  const query = `
      UPDATE TicketAssignment
      SET completedAt=CURRENT_TIMESTAMP
      WHERE ticketID='${ticketID}'
    `;

  return runQuery(query);
}

module.exports = {
  create,
  getAll,
  updateType,
  updateStatus,
  updatePriority,
  assign
};
