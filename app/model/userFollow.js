'use strict';

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
    originId: {
      type: UUID,
      references: {
        // 这是引用另一个模型
        model: 'user',
        // 这是引用模型的列名称
        key: 'id',
      },
      allowNull: false,
    },
    targetId: {
      type: UUID,
      references: {
        // 这是引用另一个模型
        model: 'user',
        // 这是引用模型的列名称
        key: 'id',
      },
      allowNull: false,
    },
    // 对 target 用户的备注名称
    alias: STRING(128),
    createdAt: DATE,
    updatedAt: DATE,
  });

  // 获取我关注的人
  UserFollow.prototype.getFollowing = function() {

  };

  // 获取关注我的人
  UserFollow.prototype.getFollowers = function() {

  };

  return UserFollow;
};
