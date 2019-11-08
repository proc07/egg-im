'use strict';

const BaseController = require('./base');

class ApplyController extends BaseController {
  async applyFriend() {
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
      const userRes = await ctx.model.User.findOne({
        where: { id: targetId },
      });
      if (!userRes) {
        this.baseError('该用户不存在！');
        return;
      }
      // 2.获取自己的id
      const selfData = await this.getUser();
      // 3.创建
      const applyRes = await ctx.model.Apply.create({
        description,
        type: 1,
        targetId,
        applicantId: selfData.id,
      });
      this.baseSuccess(applyRes);
    } catch (error) {
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
        type: 2,
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
