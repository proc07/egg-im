'use strict';

// 消息推送历史纪录表
module.exports = app => {
  const { UUID, UUIDV1, DATE, BLOB, STRING, TINYINT } = app.Sequelize;
  const PushHistory = app.model.define('push_history', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV1,
    },
    // 消息送到时间，可为空
    arrivalAt: DATE,
    // 实体：存储的就是 message 消息模型的 json 数据
    entity: BLOB,
    entityType: TINYINT,
    // 接收者（预加载）
    receiverId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    // User.pushId 接收者当前设备推送id
    receiverPushId: STRING(255),
    // 发送者，可为空（预加载）
    senderId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: true,
    },
    createdAt: DATE,
    updatedAt: DATE,
  });

  return PushHistory;
};