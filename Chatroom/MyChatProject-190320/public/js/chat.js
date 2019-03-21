var privatesendTo;

//添加群组
document.getElementsByClassName('add-groups')[0].onclick = function (e) {
    let newGroup = document.getElementsByClassName('groups')[0];
    if (newGroup.value !== null || newGroup.value !== undefined || newGroup.value !== '') {
        socket.emit('addGroup', newGroup.value);
        return;
    }
    newGroup.value = '请输入群组名称!!!'
}
//获取聊天对象
document.getElementsByClassName('online-list')[0].onclick = function (e) {
    let chatTo = document.getElementsByClassName('chat-to')[0];
    let event = e || window.event;
    let target = event.target || event.srcElement;
    privatesendTo = target.className;
    if (target.nodeName.toLowerCase() == 'li') {
        chatTo.innerHTML = target.innerHTML;
        socket.emit('joinGroup', {
            groupid: privatesendTo
        });
    }
}
//发起聊天
document.getElementsByClassName('send')[0].onclick = function () {
    let msgs = null;
    let sendUser = null;
    if (document.getElementsByClassName('sendMsgs')[0]) {
        var msg = document.getElementsByClassName('sendMsgs')[0];
        if (msg.value == null || msg.value == '' || msg.value == undefined) {
            msg.value = '请输入发送内容';
            return;
        }
        msgs = msg.value;
    };
    if (document.getElementsByClassName('who-chat')[0]) {
        var whochat = document.getElementsByClassName('who-chat')[0];
        if (whochat.innerHTML != null && whochat.innerHTML != '') {
            sendUser = whochat.innerHTML;
        }
    };
    socket.emit('sendMsgs', {
        msgs: msgs,
        sendTo: privatesendTo,
        senduser: sendUser
    });
}


