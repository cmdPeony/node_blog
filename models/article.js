const { Schema, model} = require('mongoose')

const articleSchema = new Schema({
  title: { // 文章标题
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  content: { // 文章内容
    type: String,
    required: true,
    minlength: 1
  },
  status: { // 文章状态 1未删除
    type: Number,
    required: false,
    enum: [ 0, 1], // 默认未删除
    default: 1,
    select: false
  },
  flag: { // 文章设置
    type: Number,
    required: true,
    enum: [ 0, 1], // 默认所有人可见
    default: 1
  },
  __v: {type:String, select: false},
  author: { // 作者
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  visits: { // 访问量
    required: false,
    type: Number,
    default: 0,
    select: true
  },
  loves: { // 文章点赞数
    required: false,
    type: Number,
    default: 0,
    select: true
  },
  sorts: { // 文章分类
    required: true,
    type: [{ type: Schema.Types.ObjectId, ref: 'ArticleSort' }],
    select: false,
    validate: {
      validator(data) {
        console.log('分类是用来', data.length)
          if (data.length <= 3) {
              return true
          } else {
              return false
          }
      },
      message: '每篇文章最多只能添加3个分类' // 这里是返回的错误信息
    }
  },
  tags: { // 文章标签
    required: true,
    type: [{ type: Schema.Types.ObjectId, ref: 'ArticleTag' }],
    select: false,
    validate: {
      validator(data) {
          if (data.length <= 5) {
              return true
          } else {
              return false
          }
      },
      message: '每篇文章最多只能添加5个标签' // 这里是返回的错误信息
    }
  }
}, { timestamps: { createdAt: 'created', updatedAt: 'updated'}})

module.exports = model('Article', articleSchema)