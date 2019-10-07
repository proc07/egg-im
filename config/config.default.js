/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1565161174649_1895';

  // add your middleware config here
  config.middleware = [
  ];

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    database: 'zl-im',
    username: 'root',
    password: '123456',
    define: {
      freezeTableName: true,
    },
    // https://github.com/sequelize/sequelize/issues/854
    timezone: '+08:00', // 保存为本地时区
    dialectOptions: {
      dateStrings: true,
      typeCast(field, next) {
        // for reading from database
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
  };

  config.cluster = {
    listen: {
      port: 7000,
      hostname: '127.0.0.1',
      // path: '/var/run/egg.sock',
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    view: {
      defaultViewEngine: 'nunjucks',
      mapping: {
        '.tpl': 'nunjucks',
      },
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
