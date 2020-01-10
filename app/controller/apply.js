'use strict';

const BaseController = require('./base');
const { APPLY_TYPE_USER, APPLY_TYPE_GROUP, SYSTEM_ID } = require('../types');

class ApplyController extends BaseController {
  async applyFriend() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const { description, targetId } = ctx.request.body;
    const selfData = await this.getUser();

    try {
      // 1.验证targetId
      const userRes = await ctx.model.User.findOne({
        where: { id: targetId },
      });
      if (!userRes) {
        this.baseError('该用户不存在！');
        return;
      }
      // 2.检测是否已提交过
      const isApply = await ctx.model.Apply.findOne({
        where: {
          targetId,
          type: APPLY_TYPE_USER,
          applicantId: selfData.id,
        },
      });
      if (isApply) {
        this.baseError('已提交申请，请勿重复提交！');
        return;
      }
      // 3.创建申请记录
      const applyRes = await ctx.model.Apply.create({
        description,
        type: APPLY_TYPE_USER,
        targetId,
        applicantId: selfData.id,
      });
      // 4.创建推送
      const pushRes = await ctx.service.pushHistory.createApply({
        receiverId: targetId,
        entity: applyRes.id,
      });
      const socketId = await app.sessionStore.get(`SOCKETID_${targetId}`);

      nsp.to(socketId).emit('getUnReadMsg', {
        type: 'SYSTEM',
        roomId: SYSTEM_ID,
        message: pushRes,
      });

      this.baseSuccess(pushRes);
    } catch (error) {
      console.log(error);
      this.baseError(error);
    }
  }

  async applyGroup() {
    const { ctx } = this;
    const { description, targetId } = ctx.request.body;

    try {
      // 检测是否已提交过
      const isApply = await ctx.model.Apply.findOne({
        where: { targetId },
      });
      if (isApply) {
        this.baseError('已提交申请，请勿重复提交！');
        return;
      }
      // 1.验证targetId
      const groupRes = await ctx.model.Group.findOne({
        where: { id: targetId },
      });
      if (!groupRes) {
        this.baseError('该群组不存在！');
        return;
      }
      // 2.获取自己的id
      const selfData = await this.getUser();
      // 3.创建
      const applyRes = await ctx.model.Apply.create({
        description,
        type: APPLY_TYPE_GROUP,
        targetId,
        applicantId: selfData.id,
      });
      this.baseSuccess(applyRes);
    } catch (error) {
      this.baseError(error);
    }
  }
}

module.exports = ApplyController;
