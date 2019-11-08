'use strict';
const moment = require('moment');
// 申请表
module.exports = app => {
  const { UUID, UUIDV1, DATE, STRING, TINYINT, BOOLEAN } = app.Sequelize;
  const Apply = app.model.define('apply', {
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
    // 通过或者拒绝
    // status: {
    //   type: BOOLEAN,
    //   defaultValue: false,
    // },
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

  return Apply;
};
