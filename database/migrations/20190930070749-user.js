'use strict';

module.exports = {
  up: (queryInterface, { INTEGER, CHAR, TINYINT, DATE }) => {
    return queryInterface.createTable('users', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: CHAR(30),
      gender: TINYINT,
      created_at: DATE(6),
      updated_at: DATE,
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('users');
  },
};
