'use strict';
const BaseController = require('./base');
const cloudinary = require('cloudinary');
const fs = require('mz/fs');

cloudinary.config({
  cloud_name: 'zhangli-blog',
  api_key: '972944844116738',
  api_secret: 'mNo472jpJGDw2WUKYkwZYj3-tVI',
});

class UploadController extends BaseController {
  async uploadImage() {
    const { ctx } = this;
    const filepath = ctx.request.files[0].filepath;
    try {
      // 处理文件，比如上传到云端
      const result = await cloudinary.v2.uploader.upload(filepath);
      this.baseSuccess(result);
    } catch (error) {
      console.log('cloudinary.v2.uploader.upload', error);
      this.baseError(error);
    } finally {
      // 需要删除临时文件
      await fs.unlink(filepath);
    }
  }

  async uploadVideo() {
    const { ctx } = this;
  }
}

module.exports = UploadController;
