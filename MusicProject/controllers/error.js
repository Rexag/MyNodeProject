"use strict";

module.exports = (options) => {
    return async (ctx, next) => {
        try {
            //逻辑处理
            
            //放行
            await next();
        } catch (e) {
            console.log(e,"e");
            ctx.render('error', { msg: '002状态错误，原因是：xxxx' });
        }
    }
}