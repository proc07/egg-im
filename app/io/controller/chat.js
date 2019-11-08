'use strict';

const Controller = require('egg').Controller;
const userStore = {};

class ChatController extends Controller {
  async chatMessage() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const message = ctx.args[0] || {};

    try {
      nsp.emit('chatMessage', message);
    } catch (error) {
      app.logger.error(error);
    }
  }

  async sendMsg() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const { msg, friendId } = ctx.args[0] || {};

    const msgRes = await ctx.model.PushHistory.create({
      entity: {},
      entityType: 1,
      receiverId: '',
      receiverPushId: '',
      senderId: '',
    });

    nsp.emit('chatMessage', msgRes);
  }
}

module.exports = ChatController;
