// 文章类别
const { Schema, model}  = require('mongoose')

const linkScheme = new Schema({
  name: { // 链接名称
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  __v: {type:String, select: false},
  url: { // 路径
    type: String,
    required: true,
    minlength: 6
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    select: false
  },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated'}})

module.exports = model('FriendLink', linkScheme)