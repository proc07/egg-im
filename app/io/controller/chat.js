'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');

class ChatController extends Controller {
  async sendMsg() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const { msg, roomid } = ctx.args[0] || {};
    const { token } = ctx.socket.handshake.query;
    const userRes = await app.sessionStore.get(token);
    const followRes = await ctx.model.UserFollow.findOne({
      where: {
        id: roomid,
      },
    });
    const receiverId = followRes.originId === userRes.id ? followRes.targetId : followRes.originId;

    const msgRes = await ctx.model.PushHistory.create({
      arrivalAt: null,
      entity: JSON.stringify({
        id: 'uuid-' + Date.now(),
        attach: '',
        content: msg,
        groupId: '',
        receiverId,
        senderId: userRes.id,
        type: 1,
      }),
      entityType: 1,
      receiverId,
      receiverPushId: '',
      senderId: userRes.id,
    });

    if (msgRes) {
      ctx.socket.to(roomid).volatile.emit('chatMessage', {
        msg: userRes.name + '说：' + msg,
        id: msgRes.id,
      });
    } else {
      ctx.socket.to(roomid).volatile.emit('chatMessage', '发送失败，请重试！');
    }
  }

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
}

module.exports = ChatController;
