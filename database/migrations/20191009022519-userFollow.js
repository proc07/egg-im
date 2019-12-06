'use strict';

module.exports = {
  up: (queryInterface, { UUID, UUIDV1, DATE, STRING }) => {
    return queryInterface.createTable('user_follow', {
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
    }, {
      classMethods: {
        associate(model) {
          // { foreignKey: 'originId', targetKey: 'id' }
          console.log('associate');
          model.UserFollow.belongsTo(model.User);
        },
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_follow');
  },
};
