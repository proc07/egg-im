'use strict';

module.exports = app => {
  const { INTEGER, CHAR, TINYINT, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: CHAR(30),
    // 0 = 女, 1 = 男
    gender: TINYINT,
    created_at: DATE,
    updated_at: DATE,
  });

  User.prototype.getUserInfoById = function() {

  };

  return User;
};
