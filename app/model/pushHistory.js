'use strict';
const moment = require('moment');
// 消息推送历史纪录表
// 作用：用户需要收到哪些消息。不管是人给我发的，还是群发的，还是系统发的，都会在这个表中有一条记录
module.exports = app => {
  const { UUID, UUIDV1, DATE, BLOB, STRING, INTEGER } = app.Sequelize;
  const PushHistory = app.model.define('push_history', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV1,
    },
    // 消息送到时间，默认为空
    arrivalAt: {
      type: DATE,
      get() {
        const arrivalAt = this.getDataValue('arrivalAt');
        if (!arrivalAt) {
          return null;
        }
        return moment(arrivalAt).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    entity: BLOB,
    entityType: INTEGER,
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
    // 发送者(系统，群，用户)
    senderId: {
      type: UUID,
      allowNull: true,
    },
    // 群id（群id存在时，发送者id为空）
    // groupId: {
    //   type: UUID,
    //   references: {
    //     model: 'group',
    //     key: 'id',
    //   },
    //   allowNull: true,
    // },
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

  return PushHistory;
};
