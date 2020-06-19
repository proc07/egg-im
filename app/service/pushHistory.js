'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const {
  PUSH_TYPE_MESSAGE,
  PUSH_TYPE_GROUP_MESSAGE,
  PUSH_TYPE_ADD_GROUP,
} = require('../types');

class PushHistoryService extends Service {

  // 聊天消息
  async userSendFriend({ senderId, receiverId, entity }) {
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

  // 申请记录
  async createApply({ receiverId, entity, entityType }) {
    const { ctx } = this;

    const res = await ctx.model.PushHistory.create({
      arrivalAt: null, // 标记未读
      entity,
      entityType,
      receiverId,
      receiverPushId: '',
      senderId: null, // 系统通知
    });

    return res;
  }

  // 创建群 例（小明邀请了小红、小白、小黄加入群聊）
  async gourpSendUser({ receiverId, groupId, entity }) {
    const { ctx } = this;

    const res = await ctx.model.PushHistory.create({
      arrivalAt: null, // 标记未读
      entity: JSON.stringify(entity),
      entityType: PUSH_TYPE_ADD_GROUP,
      senderId: groupId,
      receiverId,
      receiverPushId: '',
    });

    return res;
  }

  // 用户发送给群
  async userSendGroup({ groupId, entity }) {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    let messageRes = null;
    // const rooms = ctx.socket.adapter.rooms[groupId];

    const groupMembers = await ctx.model.GroupMember.findAll({
      where: {
        groupId,
      },
    });

    for (const member of groupMembers) {
      // 任意一条消息，receiverId 参数不是发送人的 userid
      messageRes = await ctx.model.PushHistory.create({
        arrivalAt: null, // 标记未读
        entity: JSON.stringify(entity),
        entityType: PUSH_TYPE_GROUP_MESSAGE,
        senderId: groupId,
        receiverId: member.userId,
        receiverPushId: '',
      });
    }
    messageRes.entity = JSON.parse(messageRes.entity);
    // console.log(messageRes);
    // 发送给房间全部人 #https://github.com/socketio/socket.io/issues/2082
    nsp.to(groupId).emit('getUnReadMsg', {
      type: 'GROUP',
      roomId: groupId,
      message: messageRes,
    });
  }

}

module.exports = PushHistoryService;
