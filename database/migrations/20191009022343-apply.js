'use strict';

module.exports = {
  up: (queryInterface, { UUID, UUIDV1, DATE, STRING, TINYINT, BOOLEAN }) => {
    return queryInterface.createTable('apply', {
      id: {
        type: UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: UUIDV1,
      },
      description: {
        type: STRING(255),
        allowNull: false,
      },
      // 申请的类型：
      // 1 添加好友
      // 2 添加群
      type: {
        type: TINYINT,
        allowNull: false,
      },
      // 目标id，不进行强关联，不建立主外键关系
      // type = 1, User.id
      // type = 2, Group.id
      targetId: {
        type: UUID,
        allowNull: false,
      },
      // 申请人, 为空时表示系统通知
      applicantId: {
        type: UUID,
        allowNull: true,
      },
      status: {
        type: BOOLEAN,
        defaultValue: null,
      },
      createdAt: DATE,
      updatedAt: DATE,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('apply');
  },
};
