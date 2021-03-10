const MenuAdmin = require('../models/menu-admin.js')
// 验证登录
const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const auth = jwt({ secret })
const logger = require('../log/logger')

// 路径也要独一无二
class MenuAdminCtrl {
  async addMenu(ctx, next) { // 添加菜单 只能添加一级菜单
    ctx.verifyParams({
      name: { // 菜单名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      path: { // 路径
        type: 'string',
        required: false,
        min: 1,
        max: 150
      },
      level: { // 打开方式
        type: 'enum',
        required: true,
        values: ['1', '2', '3']
      },
      type: { // 打开方式
        type: 'enum',
        required: true,
        values: ['background', 'front']
      }
    })
    const { name, level, path, type } = ctx.request.body
    const repeatMenu = await MenuAdmin.findOne({ name, level, path, type })
    if(repeatMenu) {
      ctx.body = {
        code: 1011,
        message: '当前菜单已存在'
      }
    }
    await new MenuAdmin({ name, level, path, type, author: ctx.state.user._id }).save()
    ctx.query.type = 'background'
    await next()
  }
   // 查找单个菜单
  async findMenuById(ctx) {
    logger.info('查询单个菜单', ctx.params.id)
    logger.info('当前登录的账号', ctx.state.user._id)
    const menu = await MenuAdmin.findById(ctx.params.id).select('+subMenu').populate('subMenu').populate('author')
    if(!menu) {
      logger.info('查询不到菜单')
      ctx.body = {
        code: 1012,
        message: '菜单不存在'
      }
    }
    ctx.body = {
      code: 200,
      result: menu
    }
  }
  // 查找所有一级菜单 包括子菜单
  // 默认查找前台菜单
  async findAllMenus(ctx) {
    const { type = 'background' } = ctx.query
    const menus = await MenuAdmin.find({level: 1, type}).select('+subMenu').populate('subMenu').populate('author')
    logger.info('所有菜单', menus)
    // ctx.body = '查找菜单'
    ctx.body = {
      code: 200,
      result: menus
    }
  }
  // 更新菜单 名称 路径
  async updateMenuById(ctx, next) {
    ctx.verifyParams({
      name: { // 菜单名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      path: { // 路径
        type: 'string',
        required: true,
        min: 1,
        max: 150
      },
      type: { // 打开方式
        type: 'enum',
        required: true,
        values: ['background', 'front']
      }
    })
    const { type, name } = ctx.request.body
    const repeatMenu = await MenuAdmin.findOne({ name, type})
    if(repeatMenu && repeatMenu._id != ctx.params.id) {
      ctx.body = {
        code: 1011,
        message: '菜单已存在'
      }
    }
    let menu = await MenuAdmin.findByIdAndUpdate(ctx.params.id, ctx.request.body )
    if(!menu) {
      ctx.body = {
        code: 1012,
        message: '菜单不存在'
      }
    }
    ctx.query.type = 'background'
    await next()
  }
  // 删除菜单
  async deleteMenuById(ctx, next) {
    let menu = await MenuAdmin.findByIdAndDelete(ctx.params.id)
    logger.info('查询菜单', menu)
    if(!menu) {
      ctx.body = {
        code: 1012,
        message: '菜单不存在'
      }
    }
    menu.subMenu.forEach(async id => {
      await MenuAdmin.findByIdAndDelete(id)
    })
    ctx.query.type = 'background'
    await next()
  }
  // 添加子菜单
  async addSubMenu(ctx, next) {
    ctx.verifyParams({
      name: { // 菜单名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      path: { // 路径
        type: 'string',
        required: false,
        min: 1,
        max: 150
      },
      level: { // 打开方式
        type: 'enum',
        required: true,
        values: ['1', '2', '3']
      },
      type: { // 打开方式
        type: 'enum',
        required: true,
        values: ['background', 'front']
      }
    })
    const { name, level, path, type } = ctx.request.body
    const repeatMenu = await MenuAdmin.findOne({ name, type})
    if(repeatMenu) {
      ctx.body = {
        code: 1011,
        message: '菜单已存在'
      }
    }
    let menu = await MenuAdmin.findById(ctx.params.id).select('+subMenu').populate('author');
    if(!menu) {
      ctx.body = {
        code: 1012,
        message: '父菜单不存在'
      }
    }
    logger.info('新增子菜单', menu)
    const subMenu = await new MenuAdmin({ name, level, path, type, author: ctx.state.user._id }).save()
    logger.info('查询菜单', menu, subMenu)
    menu.subMenu.push(subMenu._id);
    await menu.save();
    ctx.query.type = 'background'
    await next()
  }
  // 删除子菜单
  async delSubMenu(ctx, next) { // 传2个id params是上级菜单的id request里面的是子菜单的id
    // 删除子菜单
    const subMenu = await MenuAdmin.findByIdAndDelete(ctx.request.body.id)
    logger.info('当前参数', ctx.request.body)
    if(!subMenu) {
      ctx.throw(404, '子菜单不存在')
    }
    const menu = await MenuAdmin.findById(ctx.params.id).select('+subMenu');
    const index = menu.subMenu.map(id => id.toString()).indexOf(ctx.request.body.id);
    if (index > -1) {
      // 取消关联
      menu.subMenu.splice(index, 1);
      menu.save();
    }
    ctx.query.type = 'background'
    await next()
  }
  // 更新子菜单 名称 路径
  async updateSubMenuById(ctx, next) {
    ctx.verifyParams({
      name: { // 菜单名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      path: { // 路径
        type: 'string',
        required: false,
        min: 1,
        max: 150
      },
      type: { // 打开方式
        type: 'enum',
        required: true,
        values: ['background', 'front']
      }
    })
    const { type, name } = ctx.request.body
    const repeatMenu = await MenuAdmin.findOne({ name, type})
    logger.info('吃哪个服的菜单', repeatMenu._id === ctx.params.id)
    if(repeatMenu && repeatMenu._id != ctx.params.id) {
      ctx.throw(409, '菜单名称已占用')
    }
    let menu = await MenuAdmin.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!menu) {
      ctx.body = {
        code: 1012,
        message: '菜单不存在'
      }
    }
    ctx.query.type = 'background'
    await next()
  }
  async checkGetMenuType(ctx, next) {
    const {type} = ctx.query
    if(type === 'front') {
      await next()
    } else {
      // 调用中间件验证
      await auth(ctx, next)
    }
  }
}

module.exports = new MenuAdminCtrl()