'use strict';
const moment = require('moment');
// 群聊
module.exports = app => {
  const { UUID, UUIDV1, DATE, STRING } = app.Sequelize;
  const Group = app.model.define('group', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV1,
    },
    description: STRING(255),
    name: {
      type: STRING(128),
      allowNull: false,
    },
    // 群主id（预加载）
    ownerId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    picture: STRING(255),
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

  return Group;
};
