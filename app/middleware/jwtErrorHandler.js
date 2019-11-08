'use strict';

const STATUS = 403;

module.exports = (options, app) => {
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
            success: false,
            data: null,
            message: 'token 已过期，请重试登录！',
          };
          return;
        }
      }
      await next();
    } catch (err) {
      ctx.status = STATUS;
      if (err.name === 'UnauthorizedError') {
        ctx.body = {
          success: false,
          message: err.message || 'UnauthorizedError',
        };
      } else if (err.name === 'TokenExpiredError') {
        ctx.body = {
          success: false,
          message: err.message || 'TokenExpiredError',
        };
      } else {
        ctx.body = {
          success: false,
          message: err,
        };
      }
    }
  };
};
