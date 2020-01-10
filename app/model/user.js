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
    lastReceivedAt: {
      type: DATE,
      comment: '最后收到消息的时间',
    },
    name: {
      type: STRING(128),
      unique: 'column',
      allowNull: false,
    },
    password: STRING(255),
    phone: {
      type: STRING(64),
      unique: 'column',
      allowNull: false,
    },
    portrait: STRING(255),
    pushId: {
      type: STRING(255),
      comment: '用于推送手机端设备 ID',
    },
    gender: {
      type: TINYINT,
      // validate: {
      //   isNumeric: true,
      // },
      set(val) {
        this.setDataValue('gender', parseInt(val) || '');
      },
      comment: '1 = 女, 2 = 男',
    },
    token: {
      type: STRING(191), // 191 最大长度：767(b)/4
      unique: 'column',
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
  }, {
    classMethods: {
      associate() {
        // app.model.User.belongsTo(app.model.UserFollow);
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
