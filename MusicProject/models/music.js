const db = require('./db');

module.exports = {
    // xxx:()=> db.q(ssxx);
    addMusicByObj: async sing => await db.q('insert into music (title,singer,time,filelrc,file,uid) values (?,?,?,?,?,?)', Object.values(sing)),
    updateMusic: async music => await db.q('update music set title = ?,singer = ?,time = ?,filelrc = ?,file = ?,uid = ? where id = ?', Object.values(music)),
    deleteMusicById: async id => await db.q('delete from music where id = ?', [id]),
    queryMusicById: async id => await db.q('select * from music where id = ?', [id]),
    queryMusicByUid: async uid => await db.q('select * from music where uid = ?', [uid]),
    queryMusicByPages: async pages => await db.q('select * from music where uid = ? limit ?,?', Object.values(pages)),
    queryMusicNumByuid: async uid => await db.q('select COUNT(*) as num from music where uid = ?', [uid]),
}