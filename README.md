# im-webapp

egg im webpp

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


### 踩坑笔记

#### sequelize 目前 model 不能自动生成 migrate，只能手动维护 migrate 迁移数据库（其实就是多复制一遍代码）

- (egg-sequelize issues)[https://github.com/eggjs/egg/issues/1538]

#### model 创建的表，名称后面自动添加了 's'
#### UTC时间格式问题

