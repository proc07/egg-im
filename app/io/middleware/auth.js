'use strict';

const USER_ONLINE_LIST = 'USER_ONLINE_LIST';

function getFriendUserId(itemFriend, selfId) {
  if (itemFriend.originId === selfId) {
    return itemFriend.targetId;
  } else if (itemFriend.targetId === selfId) {
    return itemFriend.originId;
  }
}

// 在每一个客户端连接或者退出时发生作用，故而我们通常在这一步进行授权认证，对认证失败的客户端做出相应的处理
module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, model } = ctx;
    const nsp = app.io.of('/chat-im');
    const { token } = socket.handshake.query;
    const userRes = await app.sessionStore.get(token);

    if (!userRes) {
      console.log('token 过期', socket.id);
      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(socket.id, true, err => {
        console.log(err);
      });
      return;
    }
    console.log('客户端连接!', userRes.name);

    // 管理 添加在线用户
    let userOnlineList = await app.sessionStore.get(USER_ONLINE_LIST) || [];
    const idIndex = userOnlineList.findIndex(id => id === userRes.id);

    if (idIndex === -1) {
      userOnlineList = userOnlineList.concat(userRes.id);
      await app.sessionStore.set(USER_ONLINE_LIST, userOnlineList);
    }
    socket.broadcast.emit('broadcast', '在线用户: ' + userOnlineList);

    // 检查 friendList 好友是否在线，并进行绑定房间
    const Op = app.Sequelize.Op;
    // 获取 向我申请的人和被我申请的人
    const followRes = await model.UserFollow.findAll({
      where: {
        [Op.or]: [
          {
            originId: userRes.id,
          },
          {
            targetId: userRes.id,
          },
        ],
      },
    });

    // 一对一
    followRes.forEach(itemFriend => {
      const friendId = getFriendUserId(itemFriend, userRes.id);
      const isOnline = userOnlineList.findIndex(id => id === friendId);

      // 好友在线，进行关联房间号
      if (isOnline !== -1) {
        console.log('加入房间：', itemFriend.id);
        socket.join(itemFriend.id);

        nsp.adapter.clients([ itemFriend.id ], (err, clients) => {
          console.log(clients, 'join clients');
        });
      }
    });

    // 一对多

    await next();
    console.log('客户端退出!', userRes.name);

    const onlineList = await app.sessionStore.get(USER_ONLINE_LIST);
    // 删除掉在线列表用户
    const dIndex = onlineList.findIndex(id => id === userRes.id);
    onlineList.splice(dIndex, 1);

    await app.sessionStore.set(USER_ONLINE_LIST, onlineList);
    socket.broadcast.emit('broadcast', '在线用户: ' + onlineList);

    followRes.forEach(itemFriend => {
      nsp.adapter.clients([ itemFriend.id ], (err, clients) => {
        console.log(clients, 'leave clients');
      });
    });

  };
};
