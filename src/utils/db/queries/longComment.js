const crypto = require("crypto");

const { createDescriptionFile } = require("../../utils");
const { runQuery } = require("./runQuery");

function create(comment) {
  const contentFileID = createDescriptionFile(comment.description);
  const id = crypto.randomUUID();

  const query = `
      INSERT INTO
        LongComment(
          id,
          contentFileID,
          authorEmail,
          ticketID
        )
      VALUES(
        '${id}',
        '${contentFileID}',
        '${comment.authorEmail}',
        '${comment.ticketID}'
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

module.exports = {
  create
};
