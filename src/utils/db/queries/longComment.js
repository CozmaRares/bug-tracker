const crypto = require("crypto");

const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");

function create(comment) {
  const contentFileID = createMarkdownFile(comment.description);
  const id = crypto.randomUUID();

  const query = `
      INSERT INTO
        LongComment(
          id,
          contentFileID,
          authorName,
          ticketID
        )
      VALUES(
        '${id}',
        '${contentFileID}',
        '${comment.authorName}',
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
