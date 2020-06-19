'use strict';
const moment = require('moment');

// 用户关注表
module.exports = app => {
  const { UUID, UUIDV1, DATE, STRING } = app.Sequelize;
  const UserFollow = app.model.define('user_follow', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV1,
    },
    // 申请者
    originId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    // 目标者
    targetId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    // 用户的名称备注
    originAlias: {
      type: STRING(128),
      comment: 'target编辑origin用户名称',
    },
    targetAlias: {
      type: STRING(128),
      comment: 'origin编辑target用户名称',
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

  UserFollow.associate = function() {
    app.model.UserFollow.belongsTo(app.model.User, { foreignKey: 'originId', targetKey: 'id', as: 'originUser' });
    app.model.UserFollow.belongsTo(app.model.User, { foreignKey: 'targetId', targetKey: 'id', as: 'targetUser' });
  };

  return UserFollow;
};
