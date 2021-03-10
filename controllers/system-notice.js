const SystemNotice = require('../models/system-notice')
const logger = require('../log/logger')

class SystemNoticeCtrl {
  // 新增公告
  async addSystemNotice(ctx, next) {
    ctx.verifyParams({
      content: { // 公告内容
        type: 'string',
        required: true,
        min: 1,
        max: 200
      }
    })
    const { content } = ctx.request.body
    await new SystemNotice({  content, status: 0, author: ctx.state.user._id }).save()
    await next()
  }
  // 修改公告
  async updateSystemNoticeById(ctx, next) {
    ctx.verifyParams({
      content: { // 公告内容
        type: 'string',
        required: true,
        min: 1,
        max: 200
      }
    })
    const { content } = ctx.request.body
    
    const notice = await SystemNotice.findByIdAndUpdate(ctx.params.id, { content, author: ctx.state.user._id })
    if(!notice) {
      ctx.body = {
        code: 1014,
        message: '公告不存在'
      }
    }
    await next()
  }
  // 删除公告
  async deleteSystemNoticeById(ctx, next) {
    const notice = await SystemNotice.findByIdAndUpdate(ctx.params.id, { status: 0 })
    if(!notice) {
      ctx.body = {
        code: 1014,
        message: '公告不存在'
      }
    }
    await next()
  }
  // 获取生效公告
  async findEffectNotice(ctx) {
    const notices = await SystemNotice.findOne({ status: 1}).select('-author -_id')
    ctx.body = {
      code: 200,
      result: {
        notices
      }
    }
  }
  // 查询所有公告 记得分页
  async findSystemNotices(ctx) {
    const { pageSize = 10, currentPage = 1} = ctx.query
    const curPage = Math.max(currentPage * 1, 1) - 1
    const perPage = Math.max(pageSize * 1, 1)

    const notices = await SystemNotice.find({}).skip(curPage * perPage).limit(perPage).select('+author').populate('author')
    logger.info('所有公告', notices)
    const total = await SystemNotice.countDocuments({});
    // ctx.body = '查找公告'
    ctx.body = {
      code: 200,
      result: {
        notices,
        total
      }
    }
  }
  // 查询当前系统公告是否已经有了
  async checkSystemNoticeStatus(ctx, next) {
    const { status } = ctx.request.body
    // 当更新公告位生效的时候 检查当前状态
    if(status === 1) {
      const notice = await SystemNotice.findOne({ status: 1})
      logger.info('当前生效公告', status)
      if(notice) {
        ctx.body = {
          code: 1015,
          message: '当前已经存在一个生效公告'
        }
      }
    }
    await next()
  }
  // 使系统公告生效
  async updateSystemNoticeStatus(ctx, next) {
    ctx.verifyParams({
      status: { // 公告内容
        type: 'enum',
        required: true,
        values: [0, 1]
      }
    })
    const { status } = ctx.request.body
    const notice = await SystemNotice.findByIdAndUpdate(ctx.params.id, { status, author: ctx.state.user._id })
    if(!notice) {
      ctx.body = {
        code: 1014,
        message: '公告不存在'
      }
    }
    await next()
  }
  async sendNotice(ctx) {
    const notices = await SystemNotice.find().skip(0).limit(10).select('+author').populate('author')
    logger.info('所有公告', notices)
    const total = await SystemNotice.countDocuments({});
    ctx.body = {
      code: 200,
      result: {
        notices,
        total
      }
    }
  }
}
module.exports = new SystemNoticeCtrl()