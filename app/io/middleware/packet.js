'use strict';

// 作用于每一个数据包（每一条消息）；在生产环境中，通常用于对消息做预处理，又或者是对加密消息的解密等操作
module.exports = () => {
  return async (ctx, next) => {
    console.log('packet start');
    await next();
    console.log('packet end');
  };
};
