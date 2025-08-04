export default () => ({
  postgres: {
    shortLinkService: {
      writer: {
        host: process.env.POSTGRESQL_HOST || '127.0.0.1',
        port: process.env.POSTGRESQL_PORT || 5432,
        username: process.env.POSTGRESQL_USERNAME || 'username',
        password: process.env.POSTGRESQL_PASSWORD || 'password',
        database: process.env.POSTGRESQL_NAME || 'default',
        timezone: process.env.TZ || 'Asia/Ho_Chi_Minh',
      },
      reader: {
        host: process.env.POSTGRESQL_HOST || '127.0.0.1',
        port: process.env.POSTGRESQL_PORT || 5432,
        username: process.env.POSTGRESQL_USERNAME || 'username',
        password: process.env.POSTGRESQL_PASSWORD || 'password',
        database: process.env.POSTGRESQL_NAME || 'default',
        timezone: process.env.TZ || 'Asia/Ho_Chi_Minh',
      },
    },
  },
});
