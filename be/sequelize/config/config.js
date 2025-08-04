// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRESQL_USERNAME || 'postgres',
    password: process.env.POSTGRESQL_PASSWORD || 'postgres',
    database: process.env.POSTGRESQL_NAME || 'shortlink',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRESQL_PORT) || 5432,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
  test: {
    username: process.env.POSTGRESQL_USERNAME || 'postgres',
    password: process.env.POSTGRESQL_PASSWORD || 'postgres',
    database: process.env.POSTGRESQL_NAME || 'shortlink_test',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRESQL_PORT) || 5432,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
  production: {
    username: process.env.POSTGRESQL_USERNAME || 'postgres',
    password: process.env.POSTGRESQL_PASSWORD || 'postgres',
    database: process.env.POSTGRESQL_NAME || 'shortlink_production',
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRESQL_PORT) || 5432,
    dialect: process.env.POSTGRESQL_DIALECT || 'postgres',
  },
};
