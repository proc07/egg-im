'use strict';

// 群组成员
module.exports = app => {
  const { UUID, UUIDV1, DATE, STRING, TINYINT } = app.Sequelize;
  const GroupMember = app.model.define('group_member', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV1,
    },
    alias: STRING(128),
    // -1 不接收消息
    //  0 默认通知级别
    //  1 接收消息不提示
    notifyLevel: {
      type: TINYINT,
      defaultValue: 0,
    },
    // 0 普通成员
    // 1 管理员
    // 100 创建者
    permissionType: {
      type: TINYINT,
      defaultValue: 0,
    },
    // 用户id（预加载）
    userId: {
      type: UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      allowNull: false,
    },
    // 群id（预加载）
    groupId: {
      type: UUID,
      references: {
        model: 'group',
        key: 'id',
      },
      allowNull: true,
    },
    createdAt: DATE,
    updatedAt: DATE,
  });

  return GroupMember;
};
