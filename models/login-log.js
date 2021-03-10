const { Schema, model} = require('mongoose')

const loginLogSchema = new Schema({
  __v: {type:String, select: false},
  loginIP: { // 登录IP地址
    required: false,
    type: String,
    select: true
  },
  loginUser: { // 多对一指向的一
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  }
},  { timestamps: {createdAt: 'created'}})

module.exports = model('loginLog', loginLogSchema)