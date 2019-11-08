# im-webapp

egg im webpp

- 如何统计聊天接口每次获取数据的时长，数据量大的时候如何进行优化。

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

### redis

- Use `redis-server` 启动服务
- Use `redis-cli` 进入命令模式，可进行查询数据

### 踩坑笔记

#### sequelize migrate 

刚开始看到文档命令，以为是可以将 model 自动转换成 migrate的。后面发现其实是不能的，只能手动维护 migrate 迁移数据库（其实就是多复制一遍代码）

- (egg-sequelize issues)[https://github.com/eggjs/egg/issues/1538]

#### UTC时间格式问题
 
用户表中 createdAt updatedAt 字段，由于 sequelize 默认使用 UTC 时间格式，创建的时候的时间会晚8个小时。

- sequelize 配置

```code
sequelize: {
  timezone: '+08:00', // 保存为本地时区
  dialectOptions: {
    useUTC: false, // for reading from database
    dateStrings: 'DATETIME',
    typeCast(field, next) {
      // for reading from database
      if (field.type === 'DATETIME') {
        return field.string();
      }
      return next();
    },
  },
},
```

设置 timezone 该参数后，在数据库查看到的数据就是北京时间了，但是使用 sequelize 查出的数据还是 UTC 格式（被seq修改了），进行设置 dialectOptions 参数可进行解决。

- (issues 854)[https://github.com/sequelize/sequelize/issues/854]

但是问题又来了，我们进行获取用户数据情况下时间是不会发生变化，但更新用户数据情况下时间格式又变成 UTC格式（2019-10-16T05:54:39.408Z）。

- (issues 9959)[https://github.com/sequelize/sequelize/issues/9959]

- 解决方案

在每个表中进行添加 get 函数处理。

```code
const User = app.model.define('user',{
  createdAt: {
    type: Sequelize.DATE,
    get() {
      return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  updatedAt: {
    type: Sequelize.DATE,
    get() {
      return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  }
}
```

