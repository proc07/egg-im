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
    gender: TINYINT,
    created_at: DATE(6),
    updated_at: DATE,
  });

  User.prototype.getUserInfoById = function() {

  };

  return User;
};
