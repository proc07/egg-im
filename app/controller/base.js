'use strict';

const { Controller } = require('egg');
const SUCCESS = 1;
const ERROR = 0;

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
      status: SUCCESS,
      data: reslut,
      message: null,
    };
    this.ctx.status = 200;
  }

  baseError(msg) {
    this.ctx.body = {
      status: ERROR,
      data: null,
      message: msg,
    };
    this.ctx.status = 200;
  }
}

module.exports = BaseController;
