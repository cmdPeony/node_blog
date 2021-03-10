const FriendLink = require('../models/friend-link')
const logger = require('../log/logger')

class FriendLinkCtrl {
  // 新增链接
  async addFriendLink(ctx, next) {
    ctx.verifyParams({
      name: { // 链接名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      url: {// 链接路径
        type: 'string',
        required: true,
        min: 6
      }
    })
    const { name, url } = ctx.request.body
    const link = await FriendLink.findOne({name, url})
    if(link) {
      ctx.throw(409, '链接url已存在')
    }
    await new FriendLink({ name, url, author: ctx.state.user._id }).save()
    await next()
  }
  // 修改链接
  async updateFriendLinkById(ctx, next) {
    ctx.verifyParams({
      name: { // 链接名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      url: {// 链接路径
        type: 'string',
        required: true,
        min: 6
      }
    })
    const { name, url } = ctx.request.body
    let link = await FriendLink.findOne({name, url})
    if(link && link._id !== ctx.params.id) {
      ctx.body = {
        code: 1008,
        message: '该链接名称已经存在'
      }
    }
    link = await FriendLink.findByIdAndUpdate(ctx.params.id, { name, url, author: ctx.state.user._id })
    if(!link) {
      ctx.body = {
        code: 1009,
        message: '链接不存在'
      }
    }
   await next()
  }
  // 删除链接
  async deleteFriendLinkById(ctx, next) {
    const link = await FriendLink.findByIdAndDelete(ctx.params.id)
    if(!link) {
      ctx.body = {
        code: 1009,
        message: '链接不存在'
      }
    }
    await next()
  }
  
  // 查询所有链接 不需要分页
  async findFriendLinks(ctx) {
    const links = await FriendLink.find({}).select('+author').populate('author')
    ctx.body = {
      code: 200,
      result: {
        links
      }
    }
  }
}
module.exports = new FriendLinkCtrl()