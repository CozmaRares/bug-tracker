const crypto = require("crypto");

const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");

async function create(project) {
  const id = crypto.randomUUID();
  const descriptionFileID = createMarkdownFile(project.description);

  const query = `
    INSERT INTO
      Project(
        id,
        name,
        descriptionFileID,
        managerName
      )
    VALUES(
      '${id}',
      '${project.name}',
      '${descriptionFileID}',
      '${project.managerName}'
    )
  `;

  const ret = await new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        id
      })
    )
  );

  await createProjectManagerHistoryEntry({
    managerName: project.managerName,
    projectID: id
  });

  return ret;
}

function getAll(...columns) {
  const query = `
    SELECT ${
      columns.length == 0
        ? "Project.*"
        : columns.map(column => `Project.${column}`).join(", ")
    }
    FROM Project
    ORDER BY name
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function getById(id) {
  const query = `
    SELECT * 
    FROM Project
    WHERE id = '${id}'
  `;

  return new Promise(resolve =>
    runQuery(query, data => {
      if (data.length) resolve(data[0]);
      else resolve(null);
    })
  );
}

function getAssignedDevs(projectID) {
  const query = `
    SELECT User.*
    FROM User
    JOIN ProjectDevHistory ON User.name = ProjectDevHistory.userName
    WHERE projectID = '${projectID}' 
      AND leftAt IS NULL
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function updateManager(projectID, managerName) {
  const query = `
    UPDATE Project
    SET managerName='${managerName}'
    WHERE id='${projectID}'
  `;

  const ret = await new Promise(resolve =>
    runQuery(query, data => resolve(data))
  );

  await updateProjectManagerHistoryEntry(projectID);
  await createProjectManagerHistoryEntry({
    managerName,
    projectID: projectID
  });

  return ret;
}

function updateName(projectID, name) {
  const query = `
    UPDATE Project
    SET name='${name}'
    WHERE id='${projectID}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function updateStatus(projectID, status) {
  const query = `
    UPDATE Project
    SET status='${status}'
    WHERE id='${projectID}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function isDevAssigned(projectID, userName) {
  const query = `
    SELECT *
    FROM ProjectDevHistory
    WHERE projectID = '${projectID}' 
      AND userName = '${userName}'
      AND leftAt IS NULL
  `;

  return new Promise(resolve =>
    runQuery(query, data => resolve(data.length != 0))
  );
}

function createProjectManagerHistoryEntry(entry) {
  const query = `
    INSERT INTO
    ProjectMangerHistory(
      managerName,
      projectID
    )
    VALUES(
      '${entry.managerName}',
      '${entry.projectID}'
    )
  `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        managerName: entry.managerName,
        projectID: entry.projectID
      })
    )
  );
}

function updateProjectManagerHistoryEntry(projectID) {
  const query = `
    UPDATE ProjectMangerHistory
    SET leftAt=CURRENT_TIMESTAMP
    WHERE leftAt IS NULL
      AND projectID='${projectID}'
  `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        projectID
      })
    )
  );
}

function addDev(userName, projectID) {
  const query = `
    INSERT INTO
    ProjectDevHistory(
        userName,
        projectID
    )
    VALUES(
    '${userName}',
    '${projectID}'
    )
  `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        userName: userName,
        projectID: projectID
      })
    )
  );
}

function removeDev(userName, projectID) {
  const query = `
    UPDATE ProjectDevHistory
    SET leftAt=CURRENT_TIMESTAMP
    WHERE leftAt IS NULL
      AND projectID='${projectID}'
      AND userName='${userName}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function moveDev(userName, oldProjectID, newProjectID) {
  await removeDev(userName, oldProjectID);

  return addDev(userName, newProjectID);
}

function getTickets(projectID) {
  const query = `
    SELECT *
    FROM Ticket
    WHERE projectID ='${projectID}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

module.exports = {
  create,
  updateManager,
  updateStatus,
  getAll,
  getById,
  isDevAssigned,
  addDev,
  updateName,
  removeDev,
  moveDev,
  getTickets,
  getAssignedDevs
};
