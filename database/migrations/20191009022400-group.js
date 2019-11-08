'use strict';

module.exports = {
  up: (queryInterface, { UUID, UUIDV1, DATE, STRING }) => {
    return queryInterface.createTable('group', {
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
      createdAt: DATE,
      updatedAt: DATE,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('group');
  },
};
