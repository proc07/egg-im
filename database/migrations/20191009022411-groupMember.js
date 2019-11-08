'use strict';

module.exports = {
  up: (queryInterface, { UUID, UUIDV1, DATE, STRING, TINYINT }) => {
    return queryInterface.createTable('group_member', {
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
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('group_member');
  },
};
