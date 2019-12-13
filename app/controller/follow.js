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

      if (oFollowRes) {
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
    const { ctx, app } = this;
    const Op = app.Sequelize.Op;

    try {
      const selfData = await this.getUser();
      const options = {
        model: ctx.model.User,
        attributes: {
          exclude: [ 'password', 'createdAt', 'updatedAt', 'token' ],
        },
        // 不展示自己id的数据
        where: { id: { [Op.ne]: selfData.id } },
        required: false,
      };

      // 获取 向我申请的人和被我申请的人
      const followRes = await ctx.model.UserFollow.findAll({
        where: {
          [Op.or]: [
            {
              originId: selfData.id,
            },
            {
              targetId: selfData.id,
            },
          ],
        },
        include: [{
          as: 'originUser',
          ...options,
        }, {
          as: 'targetUser',
          ...options,
        }],
      });
      this.baseSuccess(followRes);
    } catch (error) {
      console.log(error);
      this.baseError(error);
    }
  }

  // 获取一对一 我和好友信息
  async getFriendFollow() {
    const { ctx, app } = this;
    const { followId } = ctx.request.query;

    try {
      const followRes = await ctx.model.UserFollow.findOne({
        where: {
          id: followId,
        },
        include: [{
          as: 'originUser',
          model: ctx.model.User,
          attributes: {
            exclude: [ 'password', 'createdAt', 'updatedAt', 'token' ],
          },
        }, {
          as: 'targetUser',
          model: ctx.model.User,
          attributes: {
            exclude: [ 'password', 'createdAt', 'updatedAt', 'token' ],
          },
        }],
      });
      this.baseSuccess(followRes);
    } catch (error) {
      console.log(error);
      this.baseError(error);
    }
  }
}

module.exports = FollowController;
