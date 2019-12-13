'use strict';

const BaseController = require('./base');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');

const SALT_WORK_FACTOR = 7;

const registerRule = {
  name: {
    type: 'string',
    message: {
      required: '请填写你的名称！',
      unique: '名称已存在，请更换！',
    },
  },
  phone: {
    type: 'string',
    message: {
      required: '请填写你的邮箱！',
      unique: '邮箱已被注册，请直接登录！',
    },
  },
  password: {
    type: 'string',
    message: {
      required: '请填写你的密码！',
    },
  },
  // portrait: 'string',
  // gender: 'number',
  // description: 'string',
};

class UserController extends BaseController {
  // 注册用户
  async register() {
    const ctx = this.ctx;
    try {
      ctx.validate(registerRule, ctx.request.body);
      const { name, phone, password } = ctx.request.body;
      // 1.加盐
      const genSaltRes = await bcrypt.genSaltSync(SALT_WORK_FACTOR);
      // 2.加密
      const passwordHashRes = await bcrypt.hashSync(password, genSaltRes);
      // 3.插入
      const user = await ctx.model.User.create({ name, phone, password: passwordHashRes });

      this.baseSuccess(user);
    } catch (error) {
      if (error.code === 'invalid_param') { // 参数没传入
        this.baseError(error.errors[0].message || error);
      } else if (error.name === 'SequelizeUniqueConstraintError') { // 数据库已存在相同数据
        this.baseError(registerRule[error.errors[0].path].message.unique);
      }
    }
  }

  // 更新用户信息
  async onlyUpdatedOnce() {
    const ctx = this.ctx;
    const { id, portrait, gender, description } = ctx.request.body;
    const expiredTime = 1000 * 60 * 10; // 10分钟有效时间内可修改

    try {
      const userRes = await ctx.model.User.findOne({
        where: { id },
        attributes: {
          exclude: [ 'password', 'createdAt', 'updatedAt' ],
        },
      });
      const createTimeStamp = moment(userRes.createdAt).valueOf();
      const nowTimeStamp = moment(Date.now()).valueOf();

      if (userRes) {
        if (expiredTime >= nowTimeStamp - createTimeStamp) {
          try {
            await userRes.update({
              portrait,
              gender,
              description,
            });
            this.baseSuccess(userRes);
          } catch (e) {
            this.baseError('更新失败！');
          }
        } else {
          this.baseError('无法修改，请重新登录！');
        }
      } else {
        this.baseError('查询不到该用户！');
      }
    } catch (error) {
      this.baseError(error);
    }
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = this.getAccessToken();
    const verifyRes = await ctx.service.user.verifyToken(token);

    try {
      const userRes = await ctx.model.User.findOne({
        where: { phone: verifyRes.phone },
        attributes: {
          exclude: [ 'password', 'createdAt', 'updatedAt' ],
        },
      });
      this.baseSuccess(userRes);
    } catch (error) {
      this.baseError(error);
    }
  }

  // 登录
  async login() {
    const { ctx, app } = this;
    const { account, password } = ctx.request.body;
    const userRes = await ctx.model.User.findOne({
      where: { phone: account },
    });

    if (userRes && (await bcrypt.compareSync(password, userRes.password))) {
      // 登录成功，生成token
      const jwtToken = await ctx.service.user.createToken({
        phone: account,
      });
      const userUpdate = await userRes.update({
        token: jwtToken,
      }, {
        attributes: {
          exclude: [ 'password', 'createdAt', 'updatedAt' ],
        },
      });
      // 30day
      const expireTime = 30 * 24 * 60 * 60 * 1000;
      await app.sessionStore.set(account, jwtToken, expireTime);
      await app.sessionStore.set(jwtToken, userUpdate, expireTime);
      this.baseSuccess({
        user: userUpdate,
        jwt_token: jwtToken,
      });
    } else {
      this.baseError('账号或密码错误，请重试！');
    }
  }

  // 退出
  async logout() {
    const { ctx, app } = this;
    const token = this.getAccessToken();
    const verifyRes = await ctx.service.user.verifyToken(token);
    const isSuccess = await app.sessionStore.destroy(verifyRes.phone);
    // 是否需要删除数据中的 token
    if (isSuccess) {
      this.baseSuccess('退出成功！');
    } else {
      this.baseError('退出失败！');
    }
  }

  // 搜索用户
  async searchUserByPhoneOrName() {
    const { ctx } = this;
    const { search } = ctx.request.query;

    try {
      const userRes = await ctx.model.User.searchUser(search);
      this.baseSuccess(userRes);
    } catch (error) {
      this.baseError(error);
    }
  }

  // 获取用户群
  async getUserGroup() {
  }
}

module.exports = UserController;
