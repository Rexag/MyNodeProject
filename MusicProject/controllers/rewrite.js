"use strict";

//URL重写
module.exports = (rules) => {
    //一个ctx.url 对应多条规则的匹配
    return async (ctx, next) => {
        for (let i = 0; i < rules.length;i++) {
            let rule = rules[i];
            //是否需要使用正则
            if (rule.regex) {
                let result = rule.regex.exec(ctx.url);
                //result 不匹配null或者匹配
                if (result) {
                    //判断是直接复制还是取分组的内容
                    if (!rule.dist) {
                        ctx.url = result[1];
                    } else {
                        ctx.url = rule.dist;
                    }
                }
            }
            if (rule.src === ctx.url) {
                ctx.url = rule.dist;
            }
        }

        // 处理静态资源
        // if(ctx.url.startsWith('/public') ) {
        //   // 重写URL
        //   ctx.url = ctx.url.replace('/public','');
        // }
        // // 处理首页
        // if (ctx.url === '/') {
        //   ctx.url = '/user/login';
        // }

        // 放行
        await next();
    }
}