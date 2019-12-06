'use strict';

const STATUS = 200;
const UN_AUTHORIZED = -1;

module.exports = app => {
  const getAccessToken = ctx => {
    const bearerToken = ctx.request.header.authorization;
    return bearerToken && bearerToken.replace('Bearer ', '');
  };

  return async (ctx, next) => {
    try {
      // 单点登录
      const token = getAccessToken(ctx);

      if (token) {
        const verifyRes = await ctx.service.user.verifyToken(token);
        const jwtToken = await app.sessionStore.get(verifyRes.phone);

        if (token !== jwtToken) {
          ctx.status = STATUS;
          ctx.body = {
            status: UN_AUTHORIZED,
            message: 'Token 已过期，请重试登录！',
          };
          return;
        }
      }
      await next();
    } catch (err) {
      console.log(err);
      ctx.status = STATUS;
      ctx.body = {
        status: UN_AUTHORIZED,
        message: err,
      };
    }
  };
};
