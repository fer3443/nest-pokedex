export const EnvConfigutarion = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  database: process.env.DATABASE_URL,
  port: process.env.PORT || 3002,
});
