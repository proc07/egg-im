'use strict';

module.exports = {
  SYSTEM_ID: 'simulate_system_id',
  GET_MSG_NUM: 10, // 每次获取聊天数量

  // models
  APPLY_TYPE_USER: 1,
  APPLY_TYPE_GROUP: 2,

  MESSAGE_TYPE_STRING: 1, // 字符串类型
  MESSAGE_TYPE_IMAGE: 2, // 图片类型
  MESSAGE_TYPE_FILE: 3, // 文件类型
  MESSAGE_TYPE_VOICE: 4, // 语音类型

  PUSH_TYPE_MESSAGE: 1, // 存储 message 消息模型的 json 数据
  // ADD
  PUSH_TYPE_ADD_FRIEND: 1001, // 添加好友请求
  PUSH_TYPE_ADD_GROUP: 1002, // 添加群请求
  PUSH_TYPE_ADD_GROUP_MEMBERS: 1003,
  // MODIFY
  PUSH_TYPE_MODIFY_GROUP_NAME: 2001, // 修改了群名称（例：xxx修改群名为xxx）
  // EXIT
  PUSH_TYPE_EXIT_GROUP: 3001, // 群解散
  PUSH_TYPE_EXIT_GROUP_MEMBERS: 3001, // 群成员退出

};
