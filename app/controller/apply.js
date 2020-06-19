'use strict';

const BaseController = require('./base');
const {
  APPLY_TYPE_USER,
  APPLY_TYPE_GROUP,
  MESSAGE_TYPE_STRING,
  PUSH_TYPE_ADD_FRIEND,
  PUSH_TYPE_ADD_GROUP,
  PUSH_TYPE_ADD_GROUP_MEMBERS,
} = require('../types');

function getNameOfOtherFriends(userList, myId) {
  return userList.filter(item => item.id !== myId).map(item => item.name).join('、');
}

class ApplyController extends BaseController {
  // 加好友
  async applyFriend() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const { description, userId } = ctx.request.body;
    const selfData = await this.getUser();

    try {
      // 1.验证添加用户
      const userRes = await ctx.model.User.findOne({
        where: { id: userId },
      });
      if (!userRes) {
        this.baseError('该用户不存在！');
        return;
      }
      // 2.检测是否已提交过
      const isApply = await ctx.model.Apply.findOne({
        where: {
          targetId: userId,
          type: APPLY_TYPE_USER,
          applicantId: selfData.id,
        },
      });
      if (isApply) {
        this.baseError('已提交申请，请勿重复提交！');
        return;
      }
      // 3.创建申请记录
      const applyRes = await ctx.model.Apply.create({
        description,
        type: APPLY_TYPE_USER,
        targetId: userId,
        applicantId: selfData.id,
      });
      // 4.创建推送
      const pushRes = await ctx.service.pushHistory.createApply({
        receiverId: userId,
        entity: applyRes.id,
        entityType: PUSH_TYPE_ADD_FRIEND,
      });
      const socketId = await app.sessionStore.get(`SOCKETID_${userId}`);
      // 5.socket 发送
      nsp.to(socketId).emit('getUnReadMsg', {
        type: 'SYSTEM',
        // 替换 entity
        message: {
          entity: applyRes,
          ...pushRes,
        },
      });

      this.baseSuccess(pushRes);
    } catch (error) {
      this.baseError(error);
    }
  }

  // 创建群聊
  async createGroup() {
    const { ctx, app } = this;
    const nsp = app.io.of('/chat-im');
    const selfData = await this.getUser();
    const { uuid, name, description, members /* { id, name } */ } = ctx.request.body;

    try {
      // 1.创建群聊
      const groupRes = await ctx.model.Group.create({
        name,
        description,
        ownerId: selfData.id,
        picture: '',
      });

      // 2. 保存一条漫游消息
      await ctx.model.Message.create({
        id: uuid,
        attach: '',
        content: `"${selfData.name}"创建了群聊`, // 待定
        groupId: groupRes.id,
        // receiverId,
        senderId: selfData.id,
        type: MESSAGE_TYPE_STRING,
      });

      // 3. 将自己添加进群
      const creatorInfo = await ctx.model.GroupMember.create({
        permissionType: 100,
        userId: selfData.id,
        groupId: groupRes.id,
      });
      const getFriendsNamesTxt = getNameOfOtherFriends(members, 'ALL_FRIENDS');
      const creatorMessage = await ctx.service.pushHistory.gourpSendUser({
        groupId: groupRes.id,
        receiverId: selfData.id,
        entity: `你邀请了${getFriendsNamesTxt}加入群聊`,
      });

      // 3. 好友添加群聊
      const members_chat_data = {};
      for (const member of members) {
        const groupMemberInfo = await ctx.model.GroupMember.create({
          permissionType: 0,
          userId: member.id,
          groupId: groupRes.id,
        });
        // 4. 发送给每个人一条消息包括我自己（每个人的 entity 内容都是有所不同的）
        const getFriendsNamesTxt = getNameOfOtherFriends(members, member.id); // joinMsgRes.dataValues
        const memberMessage = await ctx.service.pushHistory.gourpSendUser({
          groupId: groupRes.id,
          receiverId: member.id,
          entity: `"${selfData.name}"邀请你加入了群聊，群聊参与人还有：${getFriendsNamesTxt}`,
        });
        members_chat_data[member.id] = {
          groupMemberInfo,
          memberMessage,
        };
      }
      // 5. socket推送给每个群用户 封装成函数统一处理
      const EXCLUDE_ATTR = [ 'password', 'createdAt', 'updatedAt', 'token' ];
      const groupMembers = await ctx.model.GroupMember.findAll({
        where: {
          groupId: groupRes.id,
        },
        include: [
          {
            as: 'userData',
            model: ctx.model.User,
            attributes: {
              exclude: EXCLUDE_ATTR,
            },
          },
        ],
      });

      for (const member of members) {
        const socketId = await app.sessionStore.get(`SOCKETID_${member.id}`);

        if (socketId) {
          // 状态：在线--> 发送
          nsp.to(socketId).emit('getUnReadMsg', {
            group: {
              selfData: members_chat_data[member.id].groupMemberInfo.dataValues,
              groupData: groupRes,
              members: groupMembers,
            },
            message: members_chat_data[member.id].memberMessage.dataValues,
            roomId: groupRes.id,
            type: 'GROUP',
            unReadNum: 1,
          });
          console.log(socketId);
          // console.log(nsp.sockets, nsp.connected);
          nsp.connected[socketId].join(groupRes.id);
        }
      }

      this.baseSuccess({
        group: {
          selfData: creatorInfo.dataValues,
          groupData: groupRes,
          members: groupMembers,
        },
        message: [ creatorMessage ],
        roomId: groupRes.id,
        type: 'GROUP',
        unReadNum: 1,
      });
    } catch (e) {
      this.baseError(e);
    }
  }

  // 申请加入群聊（暂不处理群聊审核，直接进入）
  async applyGroup() {
    const { ctx, app } = this;
    // const nsp = app.io.of('/chat-im');
    //  description 存储用户名称
    const { description, groupId } = ctx.request.body;
    const selfData = await this.getUser();

    try {
      // 1.验证targetId
      const groupRes = await ctx.model.Group.findOne({
        where: { id: groupId },
      });
      if (!groupRes) {
        this.baseError('该群聊不存在！');
        return;
      }
      // 2.检测是否已提交过
      const isApply = await ctx.model.Apply.findOne({
        where: {
          type: APPLY_TYPE_GROUP,
          targetId: groupId,
          applicantId: selfData.id,
        },
      });
      if (isApply) {
        this.baseError('已提交申请，请勿重复提交！');
        return;
      }
      // 3.申请加入群聊
      const applyRes = await ctx.model.Apply.create({
        description: `"${description}"加入了${groupRes.name}群聊`, //  例(XXX加入XXX群聊)
        type: APPLY_TYPE_GROUP,
        targetId: groupId,
        applicantId: selfData.id,
      });
      // 4.创建推送
      const pushRes = await ctx.service.pushHistory.createApply({
        receiverId: groupId,
        entity: `"${description}"加入了群聊`,
        entityType: PUSH_TYPE_ADD_GROUP_MEMBERS,
      });
      const socketGroupId = await app.sessionStore.get(`SOCKETID_${groupId}`);
      // 5.socket 发送给群聊

      this.baseSuccess(applyRes);
    } catch (error) {
      this.baseError(error);
    }
  }
}

module.exports = ApplyController;
