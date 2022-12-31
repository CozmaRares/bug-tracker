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
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    role ENUM ('ADMIN', 'MANAGER', 'DEVELOPER', 'SUBMITTER') NOT NULL DEFAULT ('SUBMITTER'),
    joinedAt DATE NOT NULL DEFAULT (CURRENT_DATE)
);

CREATE TABLE Project (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    status ENUM (
        'PROPOSITION',
        'DEVELOPMENT',
        'PRODUCTION',
        'ABANDONED',
        'ON_HOLD',
        'CANCELED'
    ) NOT NULL DEFAULT ('PROPOSITION'),
    descriptionFileID VARCHAR(36) NOT NULL,
    createdAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    updatedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    managerEmail VARCHAR(255) NOT NULL,
    FOREIGN KEY (managerEmail) REFERENCES User (email)
);

CREATE TABLE ProjectMangerHistory (
    projectID VARCHAR(36),
    managerEmail VARCHAR(255),
    joinedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    leftAt DATE,
    FOREIGN KEY (managerEmail) REFERENCES User (email),
    FOREIGN KEY (projectID) REFERENCES Project (id),
    PRIMARY KEY (managerEmail, projectID)
);

CREATE TABLE ProjectDevHistory (
    userEmail VARCHAR(255),
    projectID VARCHAR(36),
    joinedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    leftAt DATE,
    FOREIGN KEY (userEmail) REFERENCES User (email),
    FOREIGN KEY (projectID) REFERENCES Project (id),
    PRIMARY KEY (userEmail, projectID)
);

CREATE TABLE Ticket (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM ('BUG', 'FEATURE_REQUEST', 'NEED_HELP', 'DETAIL') NOT NULL DEFAULT ('NEED_HELP'),
    status ENUM (
        'COMPLETED',
        'IN_PROGRESS',
        'ASSIGNED',
        'PENDING'
    ) NOT NULL DEFAULT ('PENDING'),
    priority ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    createdAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    updatedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    descriptionFileID VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    authorEmail VARCHAR(255) NOT NULL,
    projectID VARCHAR(36) NOT NULL,
    FOREIGN KEY (projectID) REFERENCES Project (id),
    FOREIGN KEY (authorEmail) REFERENCES User (email)
);

CREATE TABLE TicketAssignment (
    userEmail VARCHAR(255),
    ticketID VARCHAR(36),
    assignedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    completedAt DATE,
    FOREIGN KEY (userEmail) REFERENCES User (email),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id),
    PRIMARY KEY (userEmail, ticketID)
);

CREATE TABLE LongComment (
    id VARCHAR(36) PRIMARY KEY,
    contentFileID VARCHAR(36) NOT NULL,
    createdAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    updatedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    authorEmail VARCHAR(255) NOT NULL,
    ticketID VARCHAR(36) NOT NULL,
    FOREIGN KEY (authorEmail) REFERENCES User (email),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id)
);

CREATE TABLE ShortComment (
    id VARCHAR(36) PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    createdAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    updatedAt DATE NOT NULL DEFAULT (CURRENT_DATE),
    authorEmail VARCHAR(255) NOT NULL,
    ticketID VARCHAR(36) NOT NULL,
    FOREIGN KEY (authorEmail) REFERENCES User (email),
    FOREIGN KEY (ticketID) REFERENCES Ticket (id)
);