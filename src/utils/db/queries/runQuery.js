const dbConnection = require("mysql2").createConnection({
  host: "localhost",
  user: "bug_tracker",
  password: "Bug_Tracker_0",
  database: "bug_tracker"
});

dbConnection.connect(err => {
  if (err) throw err;

  console.log("Connected to database");
});

function runQuery(query, cb) {
  dbConnection.query(query, (err, data) => {
    if (err) throw err;

    console.log({
      query: query
        .split("\n")
        .map(str => str.trim())
        .filter(str => str.length != 0)
        .join(" ")
    });
    cb(data);
  });
}

function endConnection() {
  dbConnection.end();
}

module.exports = {
  runQuery,
  endConnection
};
