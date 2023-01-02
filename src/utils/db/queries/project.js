const crypto = require("crypto");

const { createDescriptionFile } = require("../../utils");
const { runQuery } = require("./runQuery");

async function create(project) {
  const id = crypto.randomUUID();
  const descriptionFileID = createDescriptionFile(project.description);

  const query = `
    INSERT INTO
      Project(
        id,
        name,
        descriptionFileID,
        managerEmail
      )
    VALUES(
      '${id}',
      '${project.name}',
      '${descriptionFileID}',
      '${project.managerEmail}'
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
    managerEmail: project.managerEmail,
    projectID: id
  });

  return ret;
}

function getAll() {
  const query = `
    SELECT Project.*, User.name managerUserName 
    FROM Project
    JOIN User ON Project.managerEmail = User.email
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

async function updateManager(id, managerEmail) {
  const query = `
    UPDATE Project
    SET managerEmail='${managerEmail}', 
      updatedAt=CURRENT_DATE
    WHERE id='${id}'
  `;

  const ret = await new Promise(resolve =>
    runQuery(query, data => resolve(data))
  );

  await updateProjectManagerHistoryEntry(id);
  await createProjectManagerHistoryEntry({
    managerEmail,
    projectID: id
  });

  return ret;
}

function updateStatus(id, status) {
  const query = `
    UPDATE Project
    SET status='${status}', 
      updatedAt=CURRENT_DATE
    WHERE id='${id}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

function isUserAssigned(projectID, userEmail) {
  const query = `
    SELECT *
    FROM ProjectDevHistory
    WHERE projectID = '${projectID}' 
      AND userEmail = '${userEmail}'
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
      managerEmail,
      projectID
    )
    VALUES(
      '${entry.managerEmail}',
      '${entry.projectID}'
    )
  `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        managerEmail: entry.managerEmail,
        projectID: entry.projectID
      })
    )
  );
}

function updateProjectManagerHistoryEntry(projectID) {
  const query = `
    UPDATE ProjectMangerHistory
    SET leftAt=CURRENT_DATE
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

function addDev(userEmail, projectID) {
  const query = `
    INSERT INTO
    ProjectDevHistory(
        userEmail,
        projectID
    )
    VALUES(
    '${userEmail}',
    '${projectID}'
    )
  `;

  return new Promise(resolve =>
    runQuery(query, data =>
      resolve({
        data,
        userEmail: userEmail,
        projectID: projectID
      })
    )
  );
}

function removeDev(userEmail, projectID) {
  const query = `
    UPDATE ProjectDevHistory
    SET leftAt=CURRENT_DATE
    WHERE leftAt IS NULL
      AND projectID='${projectID}'
      AND userEmail='${userEmail}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

async function moveDev(userEmail, oldProjectID, newProjectID) {
  await removeDev(userEmail, oldProjectID);

  return addDev(userEmail, newProjectID);
}

function getTickets(projectId) {
  const query = `
    SELECT *
    FROM Ticket
    WHERE projectID ='${projectId}'
  `;

  return new Promise(resolve => runQuery(query, data => resolve(data)));
}

module.exports = {
  create,
  updateManager,
  updateStatus,
  getAll,
  getById,
  isUserAssigned,
  addDev,
  removeDev,
  moveDev,
  getTickets
};
