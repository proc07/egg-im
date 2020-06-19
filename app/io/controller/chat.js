'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const {
  CHAT_TYPE_GROUP,
  CHAT_TYPE_FRIEND,
  GET_MSG_NUM,
  MESSAGE_TYPE_STRING,
  PUSH_TYPE_MESSAGE,
  PUSH_TYPE_GROUP_MESSAGE,
  PUSH_TYPE_ADD_FRIEND,
  PUSH_TYPE_ADD_GROUP,
  PUSH_TYPE_ADD_GROUP_MEMBERS,
} = require('../../types');

class ChatController extends Controller {
  // 单聊发送
  async sendMsgToFriend() {
    const { ctx, app } = this;
    // const nsp = app.io.of('/chat-im');
    const [{ uuid, msg, roomId }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    const follows = await ctx.model.UserFollow.findOne({
      where: {
        id: roomId,
      },
    });
    const receiverId = follows.originId === userRes.id ? follows.targetId : follows.originId;

    try {
      // 创建 message 表
      const msgRes = await ctx.model.Message.create({
        id: uuid,
        attach: '',
        content: msg,
        // groupId: '',
        receiverId,
        senderId: userRes.id,
        type: MESSAGE_TYPE_STRING,
      });

      // 创建 push history 表
      const pushRes = await ctx.service.pushHistory.userSendFriend({
        senderId: userRes.id,
        receiverId,
        entity: msgRes.dataValues,
      });

      // 发送给房间其他人
      ctx.socket.to(roomId).emit('getUnReadMsg', {
        type: 'FRIEND',
        roomId,
        message: pushRes,
      });
      // 回调给自己
      callBack(null, pushRes);
    } catch (err) {
      callBack(err);
    }
  }

  // 群组发送
  async sendMsgToGroup() {
    const { ctx, app } = this;
    // const nsp = app.io.of('/chat-im');
    const [{ uuid, msg, roomId }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);

    try {
      // 创建 message 表
      const groupMessage = await ctx.model.Message.create({
        id: uuid,
        attach: '',
        content: msg,
        groupId: roomId,
        // receiverId,
        senderId: userRes.id,
        type: MESSAGE_TYPE_STRING,
      });
      // 获取发送的用户信息

      // 创建 push_history 表 & 发送 socket
      await ctx.service.pushHistory.userSendGroup({
        groupId: roomId,
        entity: groupMessage.dataValues,
      });

      // 回调成功
      callBack(null, true);
    } catch (error) {
      callBack(error);
    }
  }

  // 设置已读
  async setReadMsg() {
    const { ctx } = this;
    // const nsp = app.io.of('/chat-im');
    const [ id, callback ] = ctx.args;

    const historyData = await ctx.model.PushHistory.findOne({
      where: {
        id,
      },
    });

    const res = await historyData.update({
      arrivalAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    });

    if (res && res.arrivalAt) {
      callback(res.arrivalAt);
    }
  }

  // 获取聊天过的好友记录
  async getChatList() {
    const { ctx, app } = this;
    const Op = app.Sequelize.Op;
    // const nsp = app.io.of('/chat-im');
    const [ date, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const userRes = await app.sessionStore.get(token);
    const messageRes = [];

    // 获取全部好友
    const follows = await ctx.model.UserFollow.findAll({
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
    // 获取群聊用户列表
    const groupMembers = await ctx.model.GroupMember.findAll({
      where: {
        userId: userRes.id,
      },
    });

    // 手动加入系统通知
    follows.push({
      type: 'SYSTEM',
      originId: null,
    });

    // 群发给我的消息
    for (const member of groupMembers) {
      const groupMsg = await ctx.model.PushHistory.findAll({
        limit: GET_MSG_NUM,
        order: [
          [ 'createdAt', 'DESC' ],
        ],
        where: {
          createdAt: {
            [Op.lte]: date || nowDate,
          },
          // groupId: ,
          senderId: member.groupId,
          receiverId: userRes.id,
        },
      });

      if (groupMsg.length) {
        // 获取未读数量，首次时进行请求
        let unReadNum = 0;
        if (!date) {
          unReadNum = await ctx.model.PushHistory.count({
            where: {
              arrivalAt: null,
              // groupId: ,
              senderId: member.groupId,
              receiverId: userRes.id,
            },
          });
        }

        for (const item of groupMsg) {
          if ([ PUSH_TYPE_MESSAGE, PUSH_TYPE_GROUP_MESSAGE, PUSH_TYPE_ADD_GROUP ].indexOf(item.entityType) !== -1) {
            item.entity = JSON.parse(item.entity);
          } else if (item.entityType === PUSH_TYPE_ADD_GROUP_MEMBERS) {
            // item.entity = item.entity.toString();
          }
        }

        messageRes.push({
          type: 'GROUP',
          roomId: member.groupId,
          message: groupMsg.reverse(),
          unReadNum,
        });
      }
    }

    // 好友和系统的消息
    for (const itemFriend of follows) {
      const friendId = itemFriend.originId === userRes.id ? itemFriend.targetId : itemFriend.originId;

      // 获取全部未读消息
      const historyMsgRes = await ctx.model.PushHistory.findAll({
        limit: GET_MSG_NUM,
        order: [
          [ 'createdAt', 'DESC' ],
        ],
        where: {
          createdAt: {
            [Op.lte]: date || nowDate,
          },
          [Op.or]: [
            {
              senderId: userRes.id,
              receiverId: friendId,
            },
            {
              senderId: friendId,
              receiverId: userRes.id,
            },
          ],
        },
      });

      if (historyMsgRes.length) {
        // 获取未读数量，首次时进行请求
        let unReadNum = 0;
        if (!date) {
          unReadNum = await ctx.model.PushHistory.count({
            where: {
              arrivalAt: null,
              senderId: friendId,
              receiverId: userRes.id,
              // groupId: null,
            },
          });
        }

        for (const item of historyMsgRes) {
          if (item.entityType === PUSH_TYPE_MESSAGE) {
            item.entity = JSON.parse(item.entity);
          } else if (item.entityType === PUSH_TYPE_ADD_FRIEND) {
            const applyId = item.entity.toString();
            const applyRes = await ctx.service.apply.getApplyDataById(applyId);
            item.entity = applyRes;
          }
        }

        const friendData = {
          type: itemFriend.type || 'FRIEND',
          message: historyMsgRes.reverse(),
          unReadNum,
          roomId: itemFriend.id,
        };

        messageRes.push(friendData);
      }
    }

    callBack && callBack(messageRes);
  }

  // 获取消息记录
  async getHistoryMsg() {
    const { ctx, app } = this;
    const Op = app.Sequelize.Op;
    // const nsp = app.io.of('/chat-im');
    const [{ type, lastDate, friendId, groupId }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    let messageRes = [];
    let rules = null;

    if (type === CHAT_TYPE_FRIEND) {
      rules = [
        {
          senderId: userRes.id,
          receiverId: friendId,
        },
        {
          senderId: friendId,
          receiverId: userRes.id,
        },
      ];
    } else if (type === CHAT_TYPE_GROUP) {
      rules = [
        {
          senderId: groupId,
          receiverId: userRes.id,
        },
      ];
    }

    // 首次获取10条记录，之后加载历史记录，改由 createdAt 字段来获取，防止新增数据影响 limit
    const historyMsgRes = await ctx.model.PushHistory.findAll({
      limit: GET_MSG_NUM,
      order: [
        [ 'createdAt', 'DESC' ],
      ],
      where: {
        createdAt: {
          [Op.lt]: lastDate,
        },
        [Op.or]: rules,
      },
    });

    if (historyMsgRes && historyMsgRes.length) {
      historyMsgRes.forEach(item => {
        // console.log(item.entity);
        item.entity = JSON.parse(item.entity);
      });
      messageRes = historyMsgRes.reverse();
    }
    callBack && callBack(messageRes);
  }

  // 查看在线用户
  async getUserOnlineList() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const [ callback ] = ctx.args;
    const onlineList = await app.sessionStore.get('USER_ONLINE_LIST');
    const res = [];
    // console.log(onlineList);
    for (let i = 0; i < onlineList.length; i++) {
      const token = onlineList[i];
      const userRes = await app.sessionStore.get(token);
      const socketId = await app.sessionStore.get(`SOCKETID_${userRes.id}`);
      res.push({
        ...userRes,
        socketId,
      });
    }

    callback({
      userList: res,
      groupList: nsp.adapter.rooms,
    });
  }
}

module.exports = ChatController;
