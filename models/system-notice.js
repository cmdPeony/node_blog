const { Schema, model} = require('mongoose')

/**
 * 只允许有一个系统公告存在
 */
const systemNoticeSchema = new Schema({
  __v: {type:String, select: false},
  content: { // 公告内容
    required: false,
    type: String,
    select: true,
    minlength: 1,
    maxlength: 200
  },
  author: { // 多对一指向的一
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  status: { // 是否生效 默认是失效的
    type: Number,
    required: false,
    enum: [ 0, 1], 
    default: 0
  }
},  { timestamps: {createdAt: 'created', updatedAt: 'updated'}})

module.exports = model('SystemNotice', systemNoticeSchema)