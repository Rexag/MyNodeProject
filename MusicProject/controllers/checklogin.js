module.exports = async (ctx, next) => {
    //判断是否以/user开头
    if (ctx.url.startsWith('/user')) {
        await next();
        return;
    }
    //需要验证
    if (!ctx.session.user) {
        ctx.render('login');
        return;
    }
    await next();
}