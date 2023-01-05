const crypto = require("crypto");

const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");

async function create(comment) {
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

  const data = await runQuery(query);
  return { data, id };
}

module.exports = {
  create
};
