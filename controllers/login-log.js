const LoginLog = require('../models/login-log')
const logger = require('../log/logger')

class LoginLogCtrl {
  async findAllLoginLog(ctx) {
    const { pageSize = 10, currentPage = 1} = ctx.query
    const curPage = Math.max(currentPage * 1, 1) - 1
    const perPage = Math.max(pageSize * 1, 1)
    const logs = await LoginLog.find().skip(curPage * perPage).limit(perPage).populate('loginUser')
    const total = await LoginLog.countDocuments({});
    ctx.body = {
      code: 200,
      result: {
        logs,
        total
      }
    }
  }
  // 增加登录日志
  async addLoginLog(ctx, next) {
    const { loginIP, id } = ctx.request.body
    logger.info('当前id', id)
    await new LoginLog({ loginIP, loginUser: id }).save()
    logger.info('保存登录IP')
    await next()
  }
  // 删除登录日志
  async deleteLoginLog(ctx) {
    const log = await LoginLog.findByIdAndDelete(ctx.params.id)
    if(!log) {
      ctx.body = {
        code: 1010,
        message: '当前登录记录不存在'
      }
    }
    const logs = await LoginLog.find().skip(0).limit(10).populate('loginUser')
    const total = await LoginLog.countDocuments({});
    ctx.body = {
      code: 200,
      result: {
        logs,
        total
      }
    }
  }
}

module.exports = new LoginLogCtrl()