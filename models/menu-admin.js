// 后台菜单管理

const { Schema, model} = require('mongoose')

const menuScheme = new Schema({
  name: { // 菜单名称
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  author: { // 作者
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  __v: {type:String, select: false},
  path: { // 跳转路径
    type: String,
    required: false,
    minlength: 1,
    maxlength: 150,
    // select: false
  },
  subMenu: { // 关联的id
    type: [{ type: Schema.Types.ObjectId, ref: 'MenuAdmin' }],
    select: false,
  },
  level: { // 菜单等级
    type: String,
    required: true,
    enum: ['1', '2', '3'] // 菜单等级
  },
  type: {// 菜单类型
    type: String,
    required: true,
    enum: ['background', 'front'] // 菜单类型 前台后台
  }
}, { timestamps: {createdAt: 'created', updatedAt: 'updated'}})

// 前台菜单
module.exports = model('MenuAdmin', menuScheme)