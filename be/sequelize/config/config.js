// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRESQL_USERNAME || 'root',
    password: process.env.POSTGRESQL_PASSWORD || null,
    database: process.env.POSTGRESQL_NAME || 'database_development',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: process.env.POSTGRESQL_PORT || 3306,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
  test: {
    username: process.env.POSTGRESQL_USERNAME || 'root',
    password: process.env.POSTGRESQL_PASSWORD || null,
    database: process.env.POSTGRESQL_NAME || 'database_test',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: process.env.POSTGRESQL_PORT || 3306,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
  production: {
    username: process.env.POSTGRESQL_USERNAME || 'root',
    password: process.env.POSTGRESQL_PASSWORD || null,
    database: process.env.POSTGRESQL_NAME || 'database_production',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: process.env.POSTGRESQL_PORT || 3306,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
};
