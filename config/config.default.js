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

  // 项目配置
  config.cluster = {
    listen: {
      port: 7000,
      hostname: '127.0.0.1',
      // path: '/var/run/egg.sock',
    },
  };

  // 关闭日志
  config.logger = {
    consoleLevel: 'NONE',
  };

  // add your user config here
  const userConfig = {
    myAppName: 'egg-web-im',
    // 模版
    view: {
      defaultViewEngine: 'nunjucks',
      mapping: {
        '.tpl': 'nunjucks',
      },
    },
    security: {
      csrf: {
        enable: false,
      },
    },
    jwt: {
      secret: 'nodejs-egg+vuejs',
    },
    // 数据库
    sequelize: {
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'zl-im',
      username: 'root',
      password: '123456',
      define: {
        // model 创建的表，名称后面自动添加了 's'
        freezeTableName: true,
      },
      // https://github.com/sequelize/sequelize/issues/854
      timezone: '+08:00', // 保存为本地时区 for database
      // https://github.com/sequelize/sequelize/issues/9959
      // 获取情况下是不会发生变化
      // 更新情况下时间格式变成 UTC格式（2019-10-16T05:54:39.408Z）
      // dialectOptions: {
      //   useUTC: false, // for reading from database
      //   dateStrings: 'DATETIME',
      //   typeCast(field, next) {
      //     // for reading from database
      //     if (field.type === 'DATETIME') {
      //       return field.string();
      //     }
      //     return next();
      //   },
      // },
    },
    // 持久化缓存
    redis: {
      client: {
        host: '127.0.0.1',
        port: '6379',
        password: '',
        db: '0',
      },
      agent: true,
    },
    io: {
      init: {
        // wsEngine: 'ws',
        pingTimeout: 60000,
      },
      namespace: {
        '/chat-im': {
          connectionMiddleware: [ 'auth' ],
          packetMiddleware: [ 'packet' ],
        },
      },
      redis: {
        host: '127.0.0.1',
        port: 6379,
        // db: 0,
      },
    },
    multipart: {
      mode: 'file',
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
