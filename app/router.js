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
  io.of('/chat-im').route('chatMessage', io.controller.chat.chatMessage);
  io.of('/chat-im').route('sendMsg', io.controller.chat.sendMsg);
  io.of('/chat-im').route('readMsg', io.controller.chat.readMsg);
  io.of('/chat-im').route('getFriendMsgHistory', io.controller.chat.getFriendMsgHistory);

  // api
  router.post('/cloudinary/uploadImage', controller.upload.uploadImage);

  router.post('/user/register', controller.user.register);
  router.post('/user/onlyUpdatedOnce', controller.user.onlyUpdatedOnce);
  router.post('/user/login', controller.user.login);
  router.post('/user/logout', jwtErrorHandler, controller.user.logout);
  router.get('/user/getUserInfo', jwtErrorHandler, controller.user.getUserInfo);
  router.get('/user/searchUserByPhoneOrName', jwtErrorHandler, controller.user.searchUserByPhoneOrName);

  router.post('/apply/applyFriend', jwtErrorHandler, controller.apply.applyFriend);
  router.post('/apply/applyGroup', jwtErrorHandler, controller.apply.applyGroup);

  router.post('/follow/applyUserFollow', jwtErrorHandler, controller.follow.applyUserFollow);
  router.post('/follow/saveUserAlias', jwtErrorHandler, controller.follow.saveUserAlias);
  router.get('/follow/getFollowers', jwtErrorHandler, controller.follow.getFollowers);

  router.get('/chat/getHistory', controller.chat.getHistory);
};
