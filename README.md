# im-webapp


# 技术栈

nodejs egg + socket.io + redis + sequelize

# 数据表设计

- message 用户聊天对话表，消息存储库<-拉取漫游消息
    - 发送者id
    - 接收者id
    - 群id（群id存在时，接收者id为空）
- PushHistory消息推送历史纪录表（作用：用户需要收到哪些消息。不管是人给我发的，还是群发的，还是系统发的，都会在这个表中有一条记录）

#### 参考 (现代IM系统中消息推送和存储架构的实现)[http://www.imooc.com/article/21659]

1、发送消息是先存储后同步。
2、消息会有两个库来保存，一个是消息存储库，用于全量保存所有会话的消息，主要用于支持消息漫游。另一个是消息同步库，主要用于接收方的多端同步。
3、在线的接收方，会直接选择在线推送。
3.1、将获取的数据缓存到本地（本地存储是有大小限制的），下次进入时获取本地最后一条消息时间至现在时间之间的数据
4、对于在线推送失败或者离线的接收方，会主动的向服务端拉取所有未同步消息。
5、接收方何时来同步以及会在哪些端来同步消息对服务端来说是未知的，所以要求服务端必须保存所有需要同步到接收方的消息，这是消息同步库的主要作用 疑问点？

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### redis

- Use `redis-server` 启动服务
- Use `redis-cli -h 127.0.0.1 -p 6379 -a "zhangli123"` 进入命令模式，可进行查询数据

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

#### sequelize引起mysql错误：Too many keys specified. Max 64 keys allowed

https://www.chaoswork.cn/1064.html
