export const EnvConfigutarion = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.DATABASE_URL,
  port: process.env.PORT || 3002,
});
