const Router = require('koa-router')
// 路由前缀
const router = new Router({ prefix: '/menu'})
const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { findAllMenus, findMenuById,deleteMenuById, checkGetMenuType, updateMenuById, addMenu, addSubMenu, delSubMenu, updateSubMenuById } = require('../controllers/menu-admin')

const auth = jwt({ secret })
// type表示菜单类型
// 查找所有一级菜单
router.get('/', checkGetMenuType, findAllMenus)

// 根据id请求菜单
router.get('/:id', auth,findMenuById)

// 删除一级菜单
router.delete('/:id', auth, deleteMenuById, findAllMenus)

// 更新一级菜单
router.patch('/:id', auth, updateMenuById, findAllMenus)

// 新增一级菜单
router.post('/', auth, addMenu, findAllMenus)

// 删除子菜单 id是父菜单
router.delete('/subMenu/:id', auth, delSubMenu, findAllMenus)

// 更新子菜单 id是子菜单
router.patch('/subMenu/:id', auth, updateSubMenuById, findAllMenus)

// 新增子菜单 id狮子菜单id
router.post('/subMenu/:id', auth, addSubMenu, findAllMenus)

module.exports = router