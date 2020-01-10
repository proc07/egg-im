'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const {
  PUSH_TYPE_MESSAGE,
  PUSH_TYPE_ADD_FRIEND,
} = require('../types');

class PushHistoryService extends Service {

  async createMessage({ senderId, receiverId, entity }) {
    const { ctx } = this;
    // 转换TZ时间格式
    entity.createdAt = entity.updatedAt = moment(entity.createdAt).format('YYYY-MM-DD HH:mm:ss');
    const res = await ctx.model.PushHistory.create({
      arrivalAt: null,
      entity: JSON.stringify(entity),
      entityType: PUSH_TYPE_MESSAGE,
      receiverId,
      receiverPushId: '',
      senderId,
    });

    return res;
  }

  async createApply({ receiverId, entity }) {
    const { ctx } = this;

    const res = await ctx.model.PushHistory.create({
      arrivalAt: null,
      entity, // : JSON.stringify(entity)
      entityType: PUSH_TYPE_ADD_FRIEND,
      receiverId,
      receiverPushId: '',
      senderId: null, // 系统通知
    });

    return res;
  }

}

module.exports = PushHistoryService;
