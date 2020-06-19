'use strict';

module.exports = {
  LIMIT_SIZE: 10,
  GET_MSG_NUM: 10, // 每次获取聊天数量

  // chat 3种类型
  CHAT_TYPE_SYSTEM: 3,
  CHAT_TYPE_GROUP: 2,
  CHAT_TYPE_FRIEND: 1,

  // apply
  APPLY_TYPE_USER: 1, // 好友申请
  APPLY_TYPE_GROUP: 2, // 群聊申请

  // message type
  MESSAGE_TYPE_STRING: 1, // 字符串类型
  MESSAGE_TYPE_IMAGE: 2, // 图片类型
  MESSAGE_TYPE_FILE: 3, // 文件类型
  MESSAGE_TYPE_VOICE: 4, // 语音类型

  // push history
  PUSH_TYPE_MESSAGE: 1, // 消息数据，存储 message 消息模型的 json 数据
  PUSH_TYPE_GROUP_MESSAGE: 2, // 群组消息数据
  PUSH_TYPE_ADD_FRIEND: 1001, // 添加好友，Apply.id
  PUSH_TYPE_ADD_GROUP: 1002, // 添加群聊
  PUSH_TYPE_ADD_GROUP_MEMBERS: 1003, // 添加群聊成员
  PUSH_TYPE_MODIFY_GROUP_NAME: 2001, // 修改了群名称（例：xxx修改群名为xxx）
  PUSH_TYPE_EXIT_GROUP: 3001, // 群解散
  PUSH_TYPE_EXIT_GROUP_MEMBERS: 3001, // 群成员退出
};
