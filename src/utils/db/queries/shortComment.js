const crypto = require("crypto");

const { runQuery } = require("./runQuery");

async function create(comment) {
  const id = crypto.randomUUID();

  const query = `
      INSERT INTO
      ShortComment(
          id,
          content,
          authorName,
          ticketID
        )
      VALUES(
        '${id}',
        '${comment.content}',
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
