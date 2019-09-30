'use strict';

const moment = require('moment');

module.exports = {
  nowTime: () => moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'),
};
