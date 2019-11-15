'use strict';

const BaseController = require('./base');

class ChatController extends BaseController {
  async getHistory() {
    const { ctx } = this;
    const data = await ctx.model.PushHistory.findAll();

    data.forEach(item => {
      item.entity = item.entity.toString();
    });
    this.baseSuccess(data);
  }

}

module.exports = ChatController;
