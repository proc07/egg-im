'use strict';
const moment = require('moment');

// 用户聊天对话表，消息存储库<-拉取漫游消息
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
    // 附属信息
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
    type: {
      type: TINYINT,
      allowNull: false,
    },
    createdAt: {
      type: DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  });

  return Message;
};
