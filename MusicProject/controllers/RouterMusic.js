"use strict";

const Router = require('koa-router');
const musicModel = require('../models/music.js');
const path = require('path');
let router = new Router();
let { appPort} = require('../config');

function opUpload(ctx) {
    let { title, singer, time } = ctx.request.body;
    let { file, filelrc } = ctx.request.files;
    let uid = ctx.session.user.id;
    let saveSingObj = { title, singer, time };
    //为微信小程序做准备
    saveSingObj.filelrc = 'no upload filelrc';

    if (!file) {
        ctx.body = { code: '002', msg: '没有歌曲进行上传!' };
        ctx.throw('没有歌曲进行上传!');
        return;
    }
    //处理歌曲路径
    saveSingObj.file = '/public/files/' + path.parse(file.path).base;
    //歌词可选
    if (filelrc) {
        //                                        文件路径    文件名+后缀名
        saveSingObj.filelrc = '/public/files/' + path.parse(filelrc.path).base;
    };
    if (uid) {
        saveSingObj.uid = uid;
    }

    return saveSingObj;
};

//请求添加音乐页面
router.get('/music/add', async ctx => {
    ctx.render('add');
})

//添加音乐
router.post('/music/add-music', async ctx => {
    let saveSingObj = opUpload(ctx);
    let result = await musicModel.addMusicByObj(saveSingObj);
    ctx.body = { code: '001', msg: result.message };
});

//更新音乐
router.put('/music/update-music', async ctx => {
    let saveSingObj = opUpload(ctx);
    let { id } = ctx.request.body;
    Object.assign(saveSingObj, { id });
    let result = await musicModel.updateMusic(saveSingObj);
    if (result.affectedRows !== 1) {
        console.log(result.message, id + '更新音乐失败!');
        ctx.body = { code: '002', msg: result.message };
        return;
    }
    ctx.body = { code: '001', msg: '更新成功!' }
});

//删除音乐
router.get('/music/del-music', async ctx => {
    let id = ctx.request.query.id;
    let result = await musicModel.deleteMusicById(id);
    if (result.affectedRows === 0) {
        console.log(result.message, id + '删除音乐失败!');
        ctx.body = { code: '002', msg: '删除失败,原因如下：' + result.message };
        return;
    }
    ctx.body = { code: '001', msg: '删除成功' };
});

// 根据id查询音乐
router.get('/music/edit-music', async ctx => {
    let id = ctx.query.id;
    let musics = await musicModel.queryMusicById(id);
    // 判断是否有该歌曲
    if (musics.length === 0) {
        ctx.body = { code: '002', msg: '歌曲不存在！' };
        return;
    }
    let music = musics[0];
    // 渲染edit页面
    ctx.render('edit', {
        music: music
    })
});

//根据uid展示音乐列表
router.get('/music/index', async ctx => {
    let uid = ctx.session.user.id;
    let pages = {
        uid: uid,
        startNum: 0,
        rowCount: 12
    };
    let musics = await musicModel.queryMusicByPages(pages);
    for(var i=0;i<musics.length;i++){
        musics[i].pageNum = i;
    }
    ctx.render('index', { musics});
});

//根据uid展示音乐列表
router.post('/music/index', async ctx => {
    let uid = ctx.session.user.id;
    let pageSize = parseInt(ctx.request.body.pageSize);
    let pageNum = parseInt(ctx.request.body.pageNum);

    if (pageSize == '' || pageNum == '') {
        ctx.body = { code: "002", msg: "跳转页数或者每页数量不正确!" }
    }

    pageNum = (pageNum - 1) * pageSize;
    let pages = {
        uid: uid,
        pageNum: pageNum,
        pageSize: pageSize
    };
    let musics = await musicModel.queryMusicByPages(pages);
    ctx.body = { code: "001", musics: musics }
});

//根据uid查询音乐列表总条数
router.get('/music/music-num', async ctx => {
    let uid = ctx.session.user.id;
    let result = await musicModel.queryMusicNumByuid(uid);
    let num = result[0].num;
    ctx.body = { code: "001", num: num }
});

// 根据id查询音乐文件地址
router.get('/music/file-music', async ctx => {
    let id = ctx.request.query.id;
    let musics = await musicModel.queryMusicById(id);
    // 判断是否有该歌曲
    if (musics.length === 0) {
        ctx.body = { code: '002', msg: '歌曲不存在！' };
        return;
    }
    let music = musics[0];
    // 渲染edit页面
    ctx.body = { code: '001', music: music };
});
module.exports = router;