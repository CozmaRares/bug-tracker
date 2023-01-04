const crypto = require("crypto");

const { runQuery } = require("./runQuery");

function create(comment) {
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
