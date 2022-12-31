const USER_ROLE = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  DEVELOPER: "DEVELOPER",
  SUBMITTER: "SUBMITTER"
};

const PROJECT_STATUS = {
  PROPOSITION: "PROPOSITION",
  DEVELOPMENT: "DEVELOPMENT",
  PRODUCTION: "PRODUCTION",
  ABANDONED: "ABANDONED",
  ON_HOLD: "ON_HOLD",
  CANCELED: "CANCELED"
};

const TICKET_TYPE = {
  BUG: "BUG",
  FEATURE_REQUEST: "FEATURE_REQUEST",
  NEED_HELP: "NEED_HELP",
  DETAIL: "DETAIL"
};

const TICKET_STATUS = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  ASSIGNED: "ASSIGNED",
  PENDING: "PENDING"
};

const TICKET_PRIORITY = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  UNKNOWN: "UNKNOWN"
};

module.exports = {
  USER_ROLE,
  PROJECT_STATUS,
  TICKET_TYPE,
  TICKET_STATUS,
  TICKET_PRIORITY
};
