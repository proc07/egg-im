'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt, io } = app;

  // view
  router.get('/', controller.home.index);

  // socket.io
  io.of('/chat-im').route('chatMessage', io.controller.chat.chatMessage);
  io.of('/chat-im').route('sendMsg', io.controller.chat.sendMsg);

  // api
  router.post('/user/register', controller.user.register);
  router.post('/user/onlyUpdatedOnce', controller.user.onlyUpdatedOnce);
  router.post('/user/login', controller.user.login);
  router.post('/user/logout', jwt, controller.user.logout);
  router.get('/user/searchUserByPhoneOrName', jwt, controller.user.searchUserByPhoneOrName);

  router.post('/apply/applyFriend', jwt, controller.apply.applyFriend);
  router.post('/apply/applyGroup', jwt, controller.apply.applyGroup);

  router.post('/follow/applyUserFollow', jwt, controller.follow.applyUserFollow);
  router.post('/follow/saveUserAlias', jwt, controller.follow.saveUserAlias);
  router.get('/follow/getFollowers', jwt, controller.follow.getFollowers);
};
