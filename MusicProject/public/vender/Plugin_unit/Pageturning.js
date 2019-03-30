(function ($) {
    // 入口函数  接收参数为扩展插件父级及参数
    function init(dom, args) {
        // 如果当前显示页数小于总页数
        if (args.pageTo <= args.sumPageCount) {
            // 填充html页面内容
            fillHtml(dom, args);
            // 绑定事件
            bindEvent(dom, args);
        } else {
            alert('请输入正确页数')
        }
    }
    /** 生成翻页插件dom结构
     * 
     * @param {*} 插件父级容器 
     * @param {*} args 传入的参数列表 args.current 默认页数  args.pageCount 总页数
     * 
     */
    function fillHtml(dom, args) {
        // 清空dom元素
        dom.empty();
        //上一页
        if (args.pageTo > 1) {
            dom.append('<li class="prevPage">上一页</li>');
        } else {
            dom.remove('.prevPage');
            dom.append('<li class="disabled">上一页</li>');
        }
        //中间页数
        if (args.pageTo != 1 && args.pageTo >= 4 && args.sumPageCount != 4) {
            dom.append('<li class="tcdNumber">' + 1 + '</li>');
        }
        if (args.pageTo - 2 > 2 && args.pageTo <= args.sumPageCount && args.sumPageCount > 5) {
            dom.append('<li>...</li>');
        }
        // 中间页数利用循环生成
        var start = args.pageTo - 2;
        var end = args.pageTo + 2;
        for (; start <= end; start++) {
            if (start <= args.sumPageCount && start >= 1) {
                if (start != args.pageTo) {
                    dom.append('<li class="tcdNumber">' + start + '</li>');
                } else {
                    dom.append('<li class="current">' + start + '</li>');
                }
            }
        }
        // 判断临界值插入省略号
        if (args.pageTo + 2 < args.sumPageCount - 1 && args.sumPageCount > 5) {
            dom.append('<li>...</li>')
        }
        // 将中间数值插入html内容中
        if (args.pageTo != args.sumPageCount && args.pageTo < args.sumPageCount - 2 && args.sumPageCount != 4) {
            dom.append('<li class="tcdNumber">' + args.sumPageCount + '</li>');
        }
        //下一页  根据当前页数确定按钮显示状态
        if (args.pageTo < args.sumPageCount) {
            dom.append('<li class="nextPage">下一页</li>');
        } else {
            dom.remove('.nextPage');
            dom.append('<li class="disabled">下一页</li>');
        }
        dom.append('<input type="text" class="gotonum">');
        dom.append('<button class="gotobtn">GO</button>');
        dom.append('<label for="points" class="lab-points">每页歌曲数量(1~15)</label>');
        dom.append('<input type="number" id = "points" name="points" min="1" max="12" placeholder="' + args.pageSize + '" class="pageSize">');

        //设置每页默认数据量

        var pageSizeBox = document.getElementById('points');
        if (pageSizeBox && args.pageSize) {
            pageSizeBox.placeholder = parseInt((args.pageSize));
        }
    }

    // 点击事件  点击每一页相当于重新调用fillHtml填入参数  修改当前的显示值
    function bindEvent(obj, args) {
        //点击页码
        obj.unbind();
        args.falg = false;
        obj.on('click', '.tcdNumber', function (e) {
            var current = parseInt($(this).text());
            args.pageTo = (current - 0);
            changePage(obj, args);
        })
        //上一页
        // a.prevPage   规定只能添加到指定的子元素上的事件处理程序
        obj.on('click', '.prevPage', function (e) {
            var current = parseInt(obj.children('.current').text());
            args.pageTo = (current - 1);
            changePage(obj, args);
        })
        //下一页
        obj.on('click', '.nextPage', function (e) {
            var current = parseInt(obj.children('.current').text());
            args.pageTo = (current + 1);
            changePage(obj, args);
        })
        //跳转
        obj.on('click', '.gotobtn', function (e) {
            var current = parseInt(obj.children('.gotonum')[0].value);
            if ((current - 0) < 0) {
                args.pageTo = 1;
            } else if ((current - 0) > (args.sumPageCount - 0)) {
                args.pageTo = args.sumPageCount;
            } else {
                args.pageTo = current;
            }
            changePage(obj, args);
        })
        //改变每页展示数量并重新渲染插件
        obj.on('change', '.pageSize', function (e) {
            var sizeNum = obj.children('.pageSize')[0];
            var pageSizeBox = document.getElementById('points');
            var current = parseInt((sizeNum.value || sizeNum.placeholder));
            if ((current - 0) > (sizeNum.max - 0) || (current - 0) < (sizeNum.min - 0)) {
                pageSizeBox.value = '';
                pageSizeBox.placeholder = args.pageSize;
            } else {
                args.pageSize = current;
                args.falg = true;
                args.pageTo = 1;
                changePage(obj, args);
            }
        })
    }

    // 改变html内容
    function changePage(dom, args) {
        fillHtml(dom, args);
        if (typeof (args.backFn == "function")) {
            args.backFn(args);
        }
    }

    // 利用jquery中的extend方法扩展插件  将插件扩展到jquery的原型上 扩展实例插件
    $.fn.createPage = function (options) {
        // 拼接参数 即如果调用插件未传入参数选用默认参数 
        // 如果传入参数 利用传入参数覆盖默认参数
        var args = $.extend({
            sumPageCount: 5,//总页数
            pageTo: 1,//跳转到第几页           
            pageSize: 3,//每页数据量
            falg: false,//是否重新渲染翻页插件
            backFn: function () { }//回调函数
        }, options);
        // 调用入口函数
        init(this, args)
    }
})(jQuery)