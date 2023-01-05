const crypto = require("crypto");

const { createMarkdownFile } = require("../../utils");
const { runQuery } = require("./runQuery");
const { PROJECT_STATUS } = require("../enums");

async function create(project) {
  const id = crypto.randomUUID();
  const descriptionFileID = createMarkdownFile(project.description);

  const query = `
    INSERT INTO
      Project(
        id,
        name,
        descriptionFileID,
        managerName,
        status
      )
    VALUES(
      '${id}',
      '${project.name}',
      '${descriptionFileID}',
      '${project.managerName}',
      '${PROJECT_STATUS.DEVELOPMENT}'
    )
  `;

  const data = await runQuery(query);

  await createProjectManagerHistoryEntry({
    managerName: project.managerName,
    projectID: id
  });

  return { data, id };
}

async function createProposition(project) {
  const id = crypto.randomUUID();
  const descriptionFileID = createMarkdownFile(project.description);

  const query = `
    INSERT INTO
      Project(
        id,
        name,
        descriptionFileID
      )
    VALUES(
      '${id}',
      '${project.name}',
      '${descriptionFileID}'
    )
  `;

  const data = await runQuery(query);
  return { data, id };
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

  return runQuery(query);
}

async function getById(id) {
  const query = `
    SELECT *
    FROM Project
    WHERE id = '${id}'
  `;

  const data = await runQuery(query);
  return (data.length ? data[0] : null);
}

async function getByName(name) {
  const query = `
    SELECT *
    FROM Project
    WHERE name = '${name}'
  `;

  const data = await runQuery(query);
  return (data.length ? data[0] : null);
}

function getAssignedDevs(projectID) {
  const query = `
    SELECT User.*
    FROM User
    JOIN ProjectDevHistory ON User.name = ProjectDevHistory.userName
    WHERE projectID = '${projectID}' 
      AND leftAt IS NULL
  `;

  return runQuery(query);
}

async function updateManager(projectID, managerName) {
  const query = `
    UPDATE Project
    SET managerName='${managerName}'
    WHERE id='${projectID}'
  `;

  const ret = await runQuery(query);

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

  return runQuery(query);
}

function updateStatus(projectID, status) {
  const query = `
    UPDATE Project
    SET status='${status}'
    WHERE id='${projectID}'
  `;

  return runQuery(query);
}

async function isDevAssigned(projectID, userName) {
  const query = `
    SELECT *
    FROM ProjectDevHistory
    WHERE projectID = '${projectID}' 
      AND userName = '${userName}'
      AND leftAt IS NULL
  `;

  const data = await runQuery(query);
  return data.length != 0;
}

async function createProjectManagerHistoryEntry(entry) {
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

  const data = await runQuery(query);
  return { data, managerName: entry.managerName, projectID: entry.projectID };
}

async function updateProjectManagerHistoryEntry(projectID) {
  const query = `
    UPDATE ProjectMangerHistory
    SET leftAt=CURRENT_TIMESTAMP
    WHERE leftAt IS NULL
      AND projectID='${projectID}'
  `;

  const data = await runQuery(query);
  return { data, projectID: projectID };
}

async function addDev(userName, projectID) {
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

  const data = await runQuery(query);
  return {
    data,
    userName: userName,
    projectID: projectID
  };
}

function removeDev(userName, projectID) {
  const query = `
    UPDATE ProjectDevHistory
    SET leftAt=CURRENT_TIMESTAMP
    WHERE leftAt IS NULL
      AND projectID='${projectID}'
      AND userName='${userName}'
  `;

  return runQuery(query);
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

  return runQuery(query);
}

module.exports = {
  create,
  createProposition,
  updateManager,
  updateStatus,
  getAll,
  getById,
  getByName,
  isDevAssigned,
  addDev,
  updateName,
  removeDev,
  moveDev,
  getTickets,
  getAssignedDevs
};
