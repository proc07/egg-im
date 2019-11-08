'use strict';

module.exports = {
  up: (queryInterface, { UUID, UUIDV1, STRING, TINYINT, DATE }) => {
    return queryInterface.createTable('user', {
      id: {
        type: UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: UUIDV1,
      },
      description: STRING(255),
      // 最后收到消息的时间
      lastReceivedAt: DATE,
      name: {
        type: STRING(128),
        unique: true,
        allowNull: false,
      },
      password: STRING(255),
      phone: {
        type: STRING(64),
        unique: true,
        allowNull: false,
      },
      portrait: STRING(255),
      // 用于推送手机端设备 ID
      pushId: STRING(255),
      // 1 = 女, 2 = 男
      gender: TINYINT,
      // 单点登录
      token: {
        type: STRING(191), // 191 最大长度：767(b)/4
        unique: true,
      },
      createdAt: DATE,
      updatedAt: DATE,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user');
  },
};
