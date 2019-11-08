'use strict';
const moment = require('moment');

// 用户表
module.exports = app => {
  const { UUID, UUIDV1, STRING, TINYINT, DATE, Op } = app.Sequelize;

  const User = app.model.define('user', {
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
    gender: {
      type: TINYINT,
      // validate: {
      //   isNumeric: true,
      // },
      set(val) {
        this.setDataValue('gender', parseInt(val) || '');
      },
    },
    // 单点登录
    token: {
      type: STRING(191), // 191 最大长度：767(b)/4
      unique: true,
    },
    createdAt: {
      type: DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  });

  User.searchUser = function(value) {
    return User.findAll({
      where: {
        [Op.or]: {
          name: {
            [Op.like]: `%${value}%`,
          },
          phone: {
            [Op.like]: `%${value}%`,
          },
        },
      },
      attributes: {
        exclude: [ 'password', 'createdAt', 'updatedAt', 'token', 'pushId', 'lastReceivedAt' ],
      },
    });
  };

  return User;
};
