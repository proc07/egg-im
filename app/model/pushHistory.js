'use strict';
const moment = require('moment');
// 消息推送历史纪录表
// 作用：我这个用户需要收到哪些消息。不管是人给我发的消息，还是群发的，还是系统发的，都会在这个表中有一条记录
module.exports = app => {
  const { UUID, UUIDV1, DATE, BLOB, STRING, TINYINT } = app.Sequelize;
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
    // 1. 实体：存储的就是 message 消息模型的 json 数据
    // 2. 用户修改了群名称（例：xxx修改了群名称）
    // 3. ...
    entity: BLOB,
    // ENTITY_TYPE_LOGOUT  -1
    // ENTITY_TYPE_MESSAGE  200
    // ENTITY_TYPE_ADD_FRIEND 1001
    // ENTITY_TYPE_ADD_GROUP 1002
    // ENTITY_TYPE_ADD_GROUP_MEMBERS 1003
    // ENTITY_TYPE_MODIFY_GROUP_MEMBERS 2001
    // ENTITY_TYPE_EXIT_GROUP_MEMBERS 3001
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
