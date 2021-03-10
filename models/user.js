const { Schema, model} = require('mongoose')

const userScheme = new Schema({
  account: { // 账号
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50
  },
  __v: {type:String, select: false},
  password: { // 密码
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  email: { // 邮箱规则校验
    type: String,
    required: false,
    validate: (value) => {
      const regx = /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/
      if(!regx.test(value)) {
        return false
      } else {
        return true
      }
    }
  },
  avatarUrl: { // 头像
    type: String,
    required: false
  }
}, { timestamps: {createdAt: 'created', updatedAt: 'updated'}})

module.exports = model('User', userScheme)