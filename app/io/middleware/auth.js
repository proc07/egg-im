'use strict';

const GET_SOCKET_BY_USERID = 'GET_SOCKET_BY_USERID';

// 在每一个客户端连接或者退出时发生作用，故而我们通常在这一步进行授权认证，对认证失败的客户端做出相应的处理
module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, model } = ctx;
    const nsp = app.io.of('/chat-im');
    const { userId } = socket.handshake.query;


    console.log('客户端连接!', userId);
    await next();
    console.log('客户端退出!');


  };
};
