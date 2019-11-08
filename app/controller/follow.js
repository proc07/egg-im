'use strict';

const BaseController = require('./base');

class FollowController extends BaseController {
  // 申请通过，添加为好友
  async applyUserFollow() {
    const { ctx } = this;
    const { originId } = ctx.request.body;

    try {
      const selfData = await this.getUser();
      const isApply = await ctx.model.Apply.findOne({
        where: {
          targetId: selfData.id,
          applicantId: originId,
        },
      });
      if (!isApply) {
        this.baseError('添加失败，请先申请！');
        return;
      }
      const isFollow = await ctx.model.UserFollow.findOne({
        where: {
          originId,
          targetId: selfData.id,
        },
      });
      if (isFollow) {
        this.baseError('请勿重复添加！');
        return;
      }

      const oFollowRes = await ctx.model.UserFollow.create({
        originId,
        targetId: selfData.id,
      });
      const tFollowRes = await ctx.model.UserFollow.create({
        originId: selfData.id,
        targetId: originId,
      });
      if (oFollowRes && tFollowRes) {
        this.baseSuccess('添加成功！');
      }
    } catch (error) {
      this.baseError(error);
    }
  }

  // 更新好友别名
  async saveUserAlias() {
    const { ctx } = this;
    const { targetId, alias } = ctx.request.body;

    try {
      const selfData = await this.getUser();
      const followRes = await ctx.model.UserFollow.findOne({
        where: {
          originId: selfData.id,
          targetId,
        },
      });
      followRes.update({
        alias,
      });
      this.baseSuccess('更新成功！');
    } catch (error) {
      this.baseError(error);
    }
  }

  // 获取我关注的人
  async getFollowers() {
    const { ctx } = this;

    try {
      const selfData = await this.getUser();
      const followRes = await ctx.model.UserFollow.findAll({
        where: {
          originId: selfData.id,
        },
      });
      this.baseSuccess(followRes);
    } catch (error) {
      this.baseError(error);
    }
  }

}

module.exports = FollowController;