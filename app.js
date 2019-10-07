'use strict';

module.exports = app => {
  console.log(app.config.env);
  if (app.config.env === 'local' || app.config.env === 'unittest') {
    // 同步数据表字段
    app.beforeStart(async () => {
      await app.model.sync({ force: true });
    });
  }
};
