'use strict';

const Service = require('egg').Service;

class ApplyService extends Service {

  async getApplyDataById(id) {
    const { ctx } = this;

    const res = await ctx.model.Apply.findOne({
      where: {
        id,
      },
      include: [{
        as: 'applicantUser',
        model: ctx.model.User,
        attributes: [ 'portrait', 'name' ],
      }],
    });

    return res;
  }

}

module.exports = ApplyService;
