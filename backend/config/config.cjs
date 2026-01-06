const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), silent: true });

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
};
