'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);

  router.get('/user', controller.user.index);
  router.get('/user/create', controller.user.create);
  router.get('/user/remove', controller.user.remove);
};
