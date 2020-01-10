'use strict';

module.exports = app => {
  if (app.config.env === 'local' || app.config.env === 'unittest') {
    // 同步数据表字段，数据会被清空
    app.beforeStart(async () => {
      // await app.model.sync({ force: true });
      await app.model.sync({ alter: true });
    });
  }

  // [egg-session] sessionStore already exists and will be overwrite
  // set redis session store
  // session store must have 3 methods
  // define sessionStore in `app.js` so you can access `app.redis`
  app.sessionStore = {
    async get(key) {
      const res = await app.redis.get(key);
      if (!res) return null;
      return JSON.parse(res);
    },

    async set(key, value, maxAge) {
      // maxAge not present means session cookies
      // we can't exactly know the maxAge and just set an appropriate value like one day
      if (!maxAge) maxAge = 24 * 60 * 60 * 1000;
      value = JSON.stringify(value);
      await app.redis.set(key, value, 'PX', maxAge);
    },

    async destroy(key) {
      return await app.redis.del(key);
    },
  };
};
