'use strict';

const { Controller } = require('egg');

class BaseController extends Controller {
  async getUser() {
    const token = this.getAccessToken();
    return await this.app.sessionStore.get(token);
  }

  getAccessToken() {
    const bearerToken = this.ctx.request.header.authorization;
    return bearerToken && bearerToken.replace('Bearer ', '');
  }

  baseSuccess(reslut) {
    this.ctx.body = {
      success: true,
      data: reslut,
      message: null,
    };
    this.ctx.status = 200;
  }

  baseError(msg) {
    this.ctx.body = {
      success: false,
      data: null,
      message: msg,
    };
    this.ctx.status = 200;
  }
}

module.exports = BaseController;
