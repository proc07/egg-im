'use strict';
const BaseController = require('./base');
const EXCLUDE_ATTR = [ 'password', 'createdAt', 'updatedAt', 'token' ];

class FollowController extends BaseController {
  // 申请通过，添加为好友
  async applyUserFollow() {
    const { ctx } = this;
    const { originId } = ctx.request.body;
    const selfData = await this.getUser();

    try {
      const applyRes = await ctx.model.Apply.findOne({
        where: {
          targetId: selfData.id,
          applicantId: originId,
        },
      });
      if (!applyRes) {
        return this.baseError('添加失败，请先申请！');
      }
      // 标记状态 => 已处理
      await applyRes.update({
        status: true,
      });
      // find or create
      const [ resFollow, created ] = await ctx.model.UserFollow.findOrCreate({
        where: {
          originId, // 对方
          targetId: selfData.id, // 我
        },
        defaults: {
          // originAlias: '',
          // targetAlias: '',
        },
      });
      // 获取对方的用户数据，前端需要数据展示
      const originUser = await ctx.model.User.findOne({
        where: {
          id: originId,
        },
        attributes: {
          exclude: EXCLUDE_ATTR,
        },
      });

      if (created === false) {
        this.baseError('请勿重复添加！');
      } else {
        this.baseSuccess({
          ...resFollow.dataValues,
          targetUser: originUser,
        });
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
          exclude: EXCLUDE_ATTR,
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
            exclude: EXCLUDE_ATTR,
          },
        }, {
          as: 'targetUser',
          model: ctx.model.User,
          attributes: {
            exclude: EXCLUDE_ATTR,
          },
        }],
      });
      this.baseSuccess(followRes);
    } catch (error) {
      console.log(error);
      this.baseError(error);
    }
  }

  // 获取加入的群组
  async getGroups() {
    const { ctx, app } = this;
    const selfData = await this.getUser();

    try {
      const groups = await ctx.model.GroupMember.findAll({
        where: {
          userId: selfData.id,
        },
        include: [
          {
            as: 'groupData',
            model: ctx.model.Group,
          },
        ],
      });

      for (const groupItem of groups) {
        const membersRes = await ctx.model.GroupMember.findAll({
          where: {
            groupId: groupItem.groupId,
          },
          include: [
            {
              as: 'userData',
              model: ctx.model.User,
              attributes: {
                exclude: EXCLUDE_ATTR,
              },
            },
          ],
        });
        groupItem.setDataValue('members', membersRes);
      }
      this.baseSuccess(groups);
    } catch (error) {
      console.log(error);
      this.baseError(error);
    }
  }
}

module.exports = FollowController;
