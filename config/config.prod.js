'use strict';
console.log(process.env.PORT, process.env.$PORT);

module.exports = {
  cluster: {
    listen: {
      port: process.env.PORT || process.env.$PORT || 7000,
      // hostname: 'https://zhangli-website.herokuapp.com',
      hostname: '0.0.0.0',
      // path: '/var/run/egg.sock',
    },
  },
  // 数据库
  sequelize: {
    dialect: 'mysql',
    host: 'us-cdbr-east-05.cleardb.net',
    port: 3306,
    database: 'heroku_e1fb114102f150f',
    username: 'be1e167be316c6',
    password: '6651dec0',
    define: {
      freezeTableName: true,
    },
    timezone: '+08:00',
  },
  // 持久化缓存
  redis: {
    client: {
      host: 'ec2-34-206-142-196.compute-1.amazonaws.com',
      port: 31059,
      password: 'pabcdaa67b0599d374803b7fda7b43af06dacb46e37f46faab4d6eca0deeab29a',
      db: '0',
    },
    agent: true,
  },
};
