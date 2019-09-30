'use strict';

module.exports = app => {
  console.log(app.config.env);
  if (app.config.env === 'local' || app.config.env === 'unittest') {
    // app.beforeStart(async () => {
    //   await app.model.sync({ force: true });
    // });
  }
};
