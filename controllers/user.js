const User = require('../models/user')
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config/config.js')
const logger = require('../log/logger')
const bcryptjs = require('bcryptjs')
class UserCtrl {
  // 查找单个用户
  async findUserById(ctx) {
    logger.info('查询单个客户', ctx.params.id)
    const user = await User.findById({_id: ctx.params.id})
    if(!user) {
      logger.info('查询不到用户')
      ctx.body = {
        code: 1016,
        message: '用户不存在'
      }
    } else {
      ctx.body = {
        code: 200,
        result: user
      }
    }
  }
  // 查找所有用户
  async findAllUsers(ctx) {
    logger.info('查询所有客户', ctx)
    const users = await User.find({})
    logger.info('所有客户', users)
    // ctx.body = '查找用户'
    ctx.body = {
      code: 200,
      result: users
    }
  }
  // 更新用户
  async updateUserById(ctx) {
    ctx.verifyParams({
      account: { type: 'string', required: false, min: 6, max: 50 },
      password: { type: 'string', required: false, min: 6, max: 50  },
      avatarUrl: { type: 'string', required: false },
      email: { // 邮箱规则校验
        type: 'email',
        required: false
      },
      loginIP: { // 登录IP地址
        required: false,
        type: 'string'
      }
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!user) {
      ctx.body = {
        code: 1016,
        message: '用户不存在'
      }
      return;
    }
    ctx.body = {
      code: 200,
      result: user
    }
  }
  // 删除用户
  async deleteUserById(ctx) {
    const user = await User.findByIdAndDelete(ctx.params.id)
    if(!user) {
      ctx.body = {
        code: 1016,
        message: '用户不存在'
      }
      return;
    }
    ctx.body = {
      code: 200,
      result: user
    }
  }
  // 新增用户 密码加密存储
  async addUser(ctx) {
    logger.info('新增用户', ctx)
    ctx.verifyParams({
      account: { type: 'string', required: true, min: 6, max: 50 },
      password: { type: 'string', required: true, min: 6, max: 50  },
      avatarUrl: { type: 'string', required: false },
      email: { // 邮箱规则校验
        type: 'email',
        required: false
      }
    })
    const { account, password } = ctx.request.body
    logger.info('测试·')
    const repeatUser = await User.findOne({ account })
    logger.info('从夫的账号', repeatUser)
    if(repeatUser) {
      ctx.body = {
        code: 1017,
        message: '账号已占用'
      }
      return;
    }
    const salt = await bcryptjs.genSalt(10)
    const bcPasswiord = await bcryptjs.hash(password, salt);
    // 存储加密的密码
    const user = await new User({account, password: bcPasswiord}).save()
    ctx.body = {
      code: 200,
      result: user
    }
  }
  // 用户登录
  async login(ctx) {
    ctx.verifyParams({
      account: { type: 'string', required: true, min: 6, max: 50 },
      password: { type: 'string', required: true, min: 6, max: 50 },
    });
    const { account, password} = ctx.request.body
    const user = await User.findOne({ account }).select('+password')
    logger.info('访问', )
    if(!user) {
      ctx.body = {
        code: 1018,
        message: '用户名或密码错误'
      }
      return;
    }
    logger.info('扥股用户', user)
    let isValid = await bcryptjs.compare(password, user.password);
    if(isValid) {
      const {_id } = user
      // 设置token的有效时间 半小时
      const token = jsonwebtoken.sign({_id, account}, secret, {expiresIn: '1h'})
      ctx.body = {
        code: 200,
        result: {
          token
        }
      }
    } else {
      ctx.body = {
        code: 1018,
        message: '用户名或密码错误'
      }
    }
  }
  // 获取登录IP
  async getClientIp(ctx, next) {
    const req = ctx.request
    const loginIP = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip  || req.connection.remoteAddress ||
    req.socket.remoteAddress || // 判断后端的 socket 的 IP
    req.connection.socket.remoteAddress || '')
    if(loginIP) {
      ctx.request.body.loginIP = loginIP + ''
    }
    logger.info('登录IP地址', loginIP)
    await next()
  }
  // 查询用户是否存在
  async checkUserExist(ctx, next) {
    const { account } = ctx.request.body
    const user = await User.findOne({account});
    if (!user) {  
      ctx.body = {
        code: 1016,
        message: '用户不存在'
      }
      return;
    }
    logger.info('当前ID', user)
    ctx.request.body.id = user._id
    await next();
  }
}
module.exports = new UserCtrl() 