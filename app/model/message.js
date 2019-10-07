'use strict';

// 用户聊天对话表
module.exports = app => {
  const { UUID, DATE, STRING, TEXT, TINYINT } = app.Sequelize;
  const Message = app.model.define('message', {
    // 不自动生成，由客户端生成id (避免复杂的服务端和客户端映射关系)
    // Socket.IO 会实时获取消息，客户端id与服务器返回的数据，进行对比id 相等说明发送成功。
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      // defaultValue: UUIDV1,
    },
    // 附件
    attach: STRING(255),
    content: {
      type: TEXT,
      allowNull: false,
    },
    // 群id（群id存在时，接收者id为空）
    groupId: {
      type: UUID,
      references: {
        model: 'group',
        key: 'id',
      },
      allowNull: true,
    },
    // 接收者id
    receiverId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: true,
    },
    // 发送者id
    senderId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    // 1 = 字符串类型
    // 2 = 图片类型
    // 3 = 文件类型
    // 4 = 语音类型
    type: {
      type: TINYINT,
      allowNull: false,
    },
    createdAt: DATE,
    updatedAt: DATE,
  });

  return Message;
};
