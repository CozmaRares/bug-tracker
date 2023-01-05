-- all queries must have an empty line between them
SET
    FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS User;

DROP TABLE IF EXISTS Project;

DROP TABLE IF EXISTS ProjectMangerHistory;

DROP TABLE IF EXISTS ProjectDevHistory;

DROP TABLE IF EXISTS Ticket;

DROP TABLE IF EXISTS TicketAssignment;

DROP TABLE IF EXISTS LongComment;

DROP TABLE IF EXISTS ShortComment;

SET
    FOREIGN_KEY_CHECKS = 1;

CREATE TABLE User (
    name VARCHAR(255) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM ('ADMIN', 'MANAGER', 'DEVELOPER', 'SUBMITTER') NOT NULL DEFAULT ('SUBMITTER'),
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY (email)
);

CREATE TABLE Project (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    status ENUM (
        'PROPOSITION',
        'DEVELOPMENT',
        'PRODUCTION',
        'ABANDONED',
        'ON HOLD',
        'CANCELED'
    ) NOT NULL DEFAULT ('PROPOSITION'),
    descriptionFileID VARCHAR(36) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    managerName VARCHAR(255),
    FOREIGN KEY (managerName) REFERENCES User (name)
);

CREATE TABLE ProjectMangerHistory (
    projectID VARCHAR(36),
    managerName VARCHAR(255),
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    leftAt DATETIME,
    FOREIGN KEY (managerName) REFERENCES User (name),
    FOREIGN KEY (projectID) REFERENCES Project (id),
    PRIMARY KEY (managerName, projectID, joinedAt)
);

CREATE TABLE ProjectDevHistory (
    userName VARCHAR(255),
    projectID VARCHAR(36),
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    leftAt DATETIME,
    FOREIGN KEY (userName) REFERENCES User (name),
    FOREIGN KEY (projectID) REFERENCES Project (id),
    PRIMARY KEY (userName, projectID, joinedAt)
);

CREATE TABLE Ticket (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM ('BUG', 'FEATURE REQUEST', 'NEED HELP', 'DETAIL') NOT NULL DEFAULT ('NEED HELP'),
    status ENUM (
        'COMPLETED',
        'IN PROGRESS',
        'ASSIGNED',
        'PENDING'
    ) NOT NULL DEFAULT ('PENDING'),
    priority ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    descriptionFileID VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    authorName VARCHAR(255) NOT NULL,
    projectID VARCHAR(36) NOT NULL,
    FOREIGN KEY (projectID) REFERENCES Project (id),
    FOREIGN KEY (authorName) REFERENCES User (name)
);

CREATE TABLE TicketAssignment (
    userName VARCHAR(255),
    ticketID VARCHAR(36),
    assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completedAt DATE,
    FOREIGN KEY (userName) REFERENCES User (name),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id),
    PRIMARY KEY (userName, ticketID)
);

CREATE TABLE LongComment (
    id VARCHAR(36) PRIMARY KEY,
    contentFileID VARCHAR(36) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    authorName VARCHAR(255) NOT NULL,
    ticketID VARCHAR(36) NOT NULL,
    FOREIGN KEY (authorName) REFERENCES User (name),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id)
);

CREATE TABLE ShortComment (
    id VARCHAR(36) PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    authorName VARCHAR(255) NOT NULL,
    ticketID VARCHAR(36) NOT NULL,
    FOREIGN KEY (authorName) REFERENCES User (name),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id)
);