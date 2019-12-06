'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');

class ChatController extends Controller {
  // 单聊发送
  async sendMsg() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const { uuid, msg, roomid } = ctx.args[0] || {};
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    const followRes = await ctx.model.UserFollow.findOne({
      where: {
        id: roomid,
      },
    });
    const receiverId = followRes.originId === userRes.id ? followRes.targetId : followRes.originId;

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

    if (historyRes) {
      // 发送给房间其他人
      ctx.socket.to(roomid).emit('unReadMsg', [ historyRes ]);
    } else {
      // 发送失败
    }
  }
  // 设置已读
  async readMsg() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
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

  // getFriendMsgHistory
  async getFriendMsgHistory() {
    const { ctx, app } = this;
    const Op = app.Sequelize.Op;
    const nsp = app.io.of('/chat-im');
    const [{ friendId }, callBack ] = ctx.args;
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);

    // 首次获取10条记录，之后加载历史记录，改由 createdAt 字段来获取，防止新增数据影响 limit
    const msgRes = await ctx.model.Message.findAll({
      limit: 10,
      order: [
        [ 'createdAt', 'DESC' ],
      ],
      where: {
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

    callBack(msgRes);
  }

}

module.exports = ChatController;
