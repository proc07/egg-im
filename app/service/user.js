'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  // 生成 Token
  createToken(data) {
    const { app } = this;
    return app.jwt.sign(data, app.config.jwt.secret, { expiresIn: '24h' });
  }

  // 验证token的合法性
  async verifyToken(token) {
    const { app } = this;
    return await app.jwt.verify(token, app.config.jwt.secret);
  }
}

module.exports = UserService;
