'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const GET_MSG_NUM = 10; // 每次获取聊天数量

class ChatController extends Controller {
  // 单聊发送
  async sendMsg() {
    const { ctx, app } = this;
    // const nsp = app.io.of('/chat-im');
    const [{ uuid, msg, roomid }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    const followRes = await ctx.model.UserFollow.findOne({
      where: {
        id: roomid,
      },
    });
    const receiverId = followRes.originId === userRes.id ? followRes.targetId : followRes.originId;

    try {
      // 创建 message 表
      const msgRes = await ctx.model.Message.create({
        id: uuid,
        attach: '',
        content: msg,
        // groupId: '',
        receiverId,
        senderId: userRes.id,
        type: 1,
      });

      // 创建 push history 表
      const historyRes = await ctx.model.PushHistory.create({
        arrivalAt: null,
        entity: JSON.stringify(msgRes.dataValues),
        entityType: 1,
        receiverId,
        receiverPushId: '',
        senderId: userRes.id,
      });

      // 发送给房间其他人
      ctx.socket.to(roomid).emit('getUnReadMsg', {
        roomId: roomid,
        message: historyRes,
      });
      // 回调给自己
      callBack(null, historyRes);
    } catch (err) {
      callBack(err);
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
    const userRes = await app.sessionStore.get(token);
    const messageRes = [];

    // 获取全部好友
    const followRes = await ctx.model.UserFollow.findAll({
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

    for (const itemFriend of followRes) {
      const friendId = itemFriend.originId === userRes.id ? itemFriend.targetId : itemFriend.originId;
      const nowDate = moment().format('YYYY-MM-DD HH:mm:ss');

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
        let unReadMsgLength = null;
        if (!date) {
          unReadMsgLength = await ctx.model.PushHistory.count({
            where: {
              arrivalAt: null,
              senderId: friendId,
              receiverId: userRes.id,
            },
          });
        }

        historyMsgRes.forEach(item => {
          item.entity = JSON.parse(item.entity);
        });

        messageRes.push({
          roomId: itemFriend.id,
          message: historyMsgRes.reverse(),
          unReadNum: unReadMsgLength,
        });
      }
    }

    callBack && callBack(messageRes);
  }

  // 获取消息记录
  async getHistoryMsg() {
    const { ctx, app } = this;
    const Op = app.Sequelize.Op;
    // const nsp = app.io.of('/chat-im');
    const [{ lastDate, friendId }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    let messageRes = [];

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

    if (historyMsgRes && historyMsgRes.length) {
      historyMsgRes.forEach(item => {
        item.entity = JSON.parse(item.entity);
      });
      messageRes = historyMsgRes.reverse();
    }
    callBack && callBack(messageRes);
  }

  // 群发送
  async sendGroupMsg() {
    const { ctx, app } = this;
    const [{ uuid, msg, groupid }, callBack ] = ctx.args;

  }
}

module.exports = ChatController;
