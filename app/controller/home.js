'use strict';

const BaseController = require('./base');

class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    await ctx.render('socketio-demo');
  }
}

module.exports = HomeController;
