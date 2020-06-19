'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware, io } = app;
  const jwtErrorHandler = middleware.jwtErrorHandler(app);

  // view
  router.get('/', controller.home.index);

  // socket.io
  io.of('/chat-im').route('sendMsgToFriend', io.controller.chat.sendMsgToFriend);
  io.of('/chat-im').route('sendMsgToGroup', io.controller.chat.sendMsgToGroup);
  io.of('/chat-im').route('setReadMsg', io.controller.chat.setReadMsg);
  io.of('/chat-im').route('getHistoryMsg', io.controller.chat.getHistoryMsg);
  io.of('/chat-im').route('getChatList', io.controller.chat.getChatList);
  io.of('/chat-im').route('getUserOnlineList', io.controller.chat.getUserOnlineList);

  // api
  router.post('/cloudinary/uploadImage', controller.upload.uploadImage);

  router.post('/user/register', controller.user.register);
  router.post('/user/onlyUpdatedOnce', controller.user.onlyUpdatedOnce);
  router.post('/user/login', controller.user.login);
  router.post('/user/logout', jwtErrorHandler, controller.user.logout);
  router.get('/user/getUserInfo', jwtErrorHandler, controller.user.getUserInfo);
  router.get('/user/searchUserByPhoneOrName', jwtErrorHandler, controller.user.searchUserByPhoneOrName);
  router.get('/user/getUserInfoById', jwtErrorHandler, controller.user.getUserInfoById);

  router.post('/apply/applyFriend', jwtErrorHandler, controller.apply.applyFriend);
  router.post('/apply/createGroup', jwtErrorHandler, controller.apply.createGroup);
  router.post('/apply/applyGroup', jwtErrorHandler, controller.apply.applyGroup);

  router.post('/follow/applyUserFollow', jwtErrorHandler, controller.follow.applyUserFollow);
  router.post('/follow/saveUserAlias', jwtErrorHandler, controller.follow.saveUserAlias);
  router.get('/follow/getFollowers', jwtErrorHandler, controller.follow.getFollowers);
  router.get('/follow/getFriendFollow', jwtErrorHandler, controller.follow.getFriendFollow);
  router.get('/follow/getGroups', jwtErrorHandler, controller.follow.getGroups);

  router.get('/chat/getHistory', controller.chat.getHistory);
};
