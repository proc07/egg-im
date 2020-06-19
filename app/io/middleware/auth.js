'use strict';

const USER_ONLINE_LIST = 'USER_ONLINE_LIST';

// 在每一个客户端连接或者退出时发生作用，故而我们通常在这一步进行授权认证，对认证失败的客户端做出相应的处理
module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, model } = ctx;
    const nsp = app.io.of('/chat-im');
    const { token } = socket.handshake.query;
    const userRes = await app.sessionStore.get(token);

    if (token === 'super-admin') {
      console.log('super-admin 进入', socket.id);
      await next();
      console.log('super-admin 退出');
      return;
    }

    if (!userRes) {
      console.log('token 过期', token, socket.id);
      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(socket.id, true, err => {
        console.log(err);
      });
      return;
    }
    // console.log('========================> 客户端连接', userRes.name);
    // 保存个人 socket id
    await app.sessionStore.set(`SOCKETID_${userRes.id}`, socket.id);

    // 管理 添加在线用户
    let userOnlineList = await app.sessionStore.get(USER_ONLINE_LIST) || [];
    const idIndex = userOnlineList.findIndex(_token => _token === token);

    if (idIndex === -1) {
      userOnlineList = userOnlineList.concat(token);
      await app.sessionStore.set(USER_ONLINE_LIST, userOnlineList);
    }

    // 不管好友在不在线，进行关联房间号
    // 检查 friendList 好友是否在线，并进行绑定房间 (获取 向我申请的人和被我申请的人)
    const Op = app.Sequelize.Op;
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
    const groupList = await model.GroupMember.findAll({
      where: {
        userId: userRes.id,
      },
    });
    // 一对一 单聊
    followRes.forEach(itemFriend => {
      socket.join(itemFriend.id);
    });
    // 一对多 群聊
    groupList.forEach(item => {
      socket.join(item.groupId);
    });

    // 获取 push_history 表中未读的数据
    // const unReadHistoryData = await model.PushHistory.findAll({
    //   where: {
    //     arrivalAt: null,
    //     receiverId: userRes.id,
    //   },
    // });
    // unReadHistoryData.forEach(item => {
    //   item.entity = item.entity.toString();
    // });
    // socket.emit('getUnReadMsg', unReadHistoryData);

    await next();
    // console.log(userRes.name, '客户端退出 <========================');

    const onlineList = await app.sessionStore.get(USER_ONLINE_LIST);
    // 删除掉在线列表用户
    const dIndex = onlineList.findIndex(_token => _token === token);
    onlineList.splice(dIndex, 1);

    await app.sessionStore.set(USER_ONLINE_LIST, onlineList);
    await app.sessionStore.destroy(`SOCKETID_${userRes.id}`);

  };
};
