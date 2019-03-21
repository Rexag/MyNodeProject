var privateTo;
var groupTo;

//发起私聊
document.getElementById('sendPrivateMsg').onclick = function () {
    console.log(document.getElementById('privateMsg').value);
    console.log(privateTo);
    socket.emit('sendPrivateMsg', {
        msg: document.getElementById('privateMsg').value,
        to: privateTo
    });
}

// 对大家说
document.getElementById('btn').onclick = function () {
    var newContent = document.getElementById('newContent').value;
    socket.emit('sendMsg', {
        newContent: newContent
    })
}

//加入群组
document.getElementById('male').onclick = function () {
    var newContent = document.getElementById('newContent').value;
    socket.emit('joinGroup', 'male');
    groupTo = 'male';
}
document.getElementById('female').onclick = function () {
    socket.emit('joinGroup', 'female');
    groupTo = 'female';
}

//发起组聊
document.getElementById('sendGroupMsg').onclick = function () {
    var msg = document.getElementById('groupMsg').value;
    socket.emit('sendGroupMsg', {
        msg: document.getElementById('groupMsg').value,
        groupid:groupTo
    })
}