"use strict";

const Router = require('koa-router');
let router = new Router();
let userModel = require('../models/user');
const { appPort } = require('../config.js');
const captchapng = require('captchapng2');

//手机和邮箱验证正则
let regEmail = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
let regPhone = /^1[3-9][0-9]\d{4,8}$/;

//请求登录页面
router.get('/user/login', async ctx => {
  ctx.render('login', {
    host: '127.0.0.1:' + appPort
  });
});

//请求注册页面
router.get('/user/register', async ctx => {
  ctx.render('register');
});

//检查用户名
router.post('/user/check-username', async ctx => {
  let { username } = ctx.request.body;
  if (username) {
    let users = await userModel.queryUserByUsername(username);
    if (users.length === 0) {
      ctx.body = { code: '001', msg: '可以注册' };
      return;
    };
    ctx.body = { code: '002', msg: '用户名已经存在' };
  }
  ctx.body = { code: '002', msg: '未接收到username' };
});

//进行注册动作
router.post('/user/do-register', async ctx => {
  let { username, userpwd, confirmpwd, useremail, userphone, sex, vCode } = ctx.request.body;

  // 比较验证码v_code
  if (userpwd !== confirmpwd) {
    ctx.body = { code: '002', msg: '两次输入的密码不正确!' };
    return;
  }

  if (vCode !== ctx.session.v_code) {
    ctx.body = { code: '002', msg: '验证码不正确' };
    return;
  }
  // 判断用户名是否存在
  let users = await userModel.queryUserByUsername(username);
  // 判断是否可以注册
  if (users.length !== 0) {
    ctx.body = { code: '002', msg: '用户名已经存在！' };
    return;
  }

  try {
    // 开始注册(可以做异常捕获)
    let result = await userModel.registerUser(username, userpwd, useremail, userphone, sex);

    // insertId  rows  判断是否插入成功，再给予提示
    if (result.affectedRows === 1) {
      ctx.body = { code: '001', msg: '注册用户成功' }
      return;
    }
    // 不等于1的情况会发生在id冲突，就不插入数据
    ctx.body = { code: '002', msg: result.message };
  } catch (e) {
    // 判断e的一些信息 code
    console.log(e, '注册失败!');
    ctx.body = { code: '002', msg: '注册时异常' + e.message }
    return;
  }
});

//进行登录
router.post('/user/do-login', async ctx => {
  let { username, password } = ctx.request.body;
  let users;
  if (regEmail.test(username)) {
    users = await userModel.queryUserByUserEmail(username);
  } else if (regPhone.test(username)) {
    users = await userModel.queryUserByUserPhone(username);
  } else {
    users = await userModel.queryUserByUsername(username);
  }

  if (users.length === 0) {
    ctx.body = { code: '002', msg: '用户名或密码不正确' };
    return;
  }
  //注册时会卡死用户名，不会有重复，所以直接取第一条数据。
  let user = users[0];
  if (user.password === password) {
    ctx.body = { code: '001', msg: '登录成功' };
    ctx.session.user = user;
    return;
  }
  ctx.body = { code: '002', msg: '用户名或密码不正确' };
});

//获取验证码
router.get('/user/Captcha', async ctx => {
  let rand = parseInt(Math.random() * 9000 + 1000);
  ctx.session.v_code = rand + '';
  let png = new captchapng(80, 30, rand);
  ctx.body = png.getBuffer();
});

//退出动作
router.get('/user/logout', async ctx => {
  ctx.session.user = null;
  ctx.redirect('/user/login');
});

module.exports = router;