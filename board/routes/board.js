var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

//DB연결
mongoose.connect('mongodb://localhost/tutorial', function (error) {
    if(error){
        console.log(error);
    }
});
//시퀀스 처리 부분 (bno)
var db = mongoose.connection;
autoIncrement.initialize(db);

//var db = mongoose.createConnection('mongodb://localhost/tutorial');
//var db = mongoose.connection;

//DB Schema
var Schema = mongoose.Schema;
//sequence DB
var numSchema = new Schema({
    _id: String,
    next: Number
});
//var Num = mongoose.model('nums', numSchema);

//sequence 처리 부분
/*function boards(name) {
    var ret = Num.findOneAndUpdate({query:{_id:name}, update:{$inc : {next:1}}, "new":true, upsert:true});
    return ret.next;
}*/

//Board Schema
var boardSchema = new Schema({
    /*_id: {
        type: Number
        //default: boards("boards"),
    },*/
    title: String,
    content: String,
    writer: String,
    date: {
        type: Date,
        default: Date.now
    },
    hit : {
        type: Number,
        default: 0
    }
});

boardSchema.plugin(autoIncrement.plugin, {
    "model" : 'boards', "field": 'bno', "startAt" : 1, "incrementBy" : 1
});
var Board = mongoose.model('boards', boardSchema);


// '/board'로 들어올 시, 연결부분
router.get('/', function (req, res, next) {
    res.redirect('/board/list/1');
});

//list화면
router.get('/list/:page', function(req,res,next){
    var page = req.params.page;
    page = parseInt(page, 10);

    Board.count(function (err, cnt) {
        var size = 10;  // 한 페이지에 보여줄 개수
        var begin = (page - 1) * size; // 시작 글
        var totalPage = Math.ceil(cnt / size);  // 전체 페이지의 수 (75 / 10 = 7.5(X) -> 8(O))
        var pageSize = 10; // 페이지 링크의 개수

        // 1~10페이지는 1로, 11~20페이지는 11로 시작되어야하기 때문에 숫자 첫째자리의 수를 고정시키기 위한 계산법
        var startPage = Math.floor((page-1) / pageSize) * pageSize + 1;
        var endPage = startPage + (pageSize - 1);

        if(endPage > totalPage) {
            endPage = totalPage;
        }

        // 전체 글이 존재하는 개수
        var max = cnt - ((page-1) * size);
        Board.find({}).sort("-bno").skip(begin).limit(size).exec(function (err, docs) {
            if (err) console.error('err', err);
            console.log('docs', docs);
            for(var i in docs){
                if(docs[i].content.length>200){
                    docs[i].content = docs[i].content.substr(0,200)+"...";
                }
            }
            var datas = {
                "title" : "게시판 리스트",
                "data" : docs,
                "page" : page,
                "pageSize" : pageSize,
                "startPage" : startPage,
                "endPage" : endPage,
                "totalPage" : totalPage,
                "max" : max
            };
            res.render('list', datas);
        });
    });
});

/*Board.find({}, function (err, rows) {
 for(var i=0; i<rows.length; i++){
 //console.log("rows : " + JSON.stringify(rows));
 res.render('list', {title: '게시판 전체 글 조회', rows: rows});
 }
 });*/
//글쓰기
router.get('/write', function (req, res, next) {
    res.render('write', {title: "게시판 글 쓰기"});
});

router.post('/write', function (req, res, next) {
    var writer = req.body.writer;
    var title = req.body.title;
    var content = req.body.content;

    var datas = new Board({
        title: title,
        content: content,
        writer: writer
    });

    datas.save(function (err) {
        if (err) throw err;
        console.log("글이 작성되었습니다.");
        res.redirect('/board');
    });
});

//글 조회화면
router.get('/read/:bno',function(req, res, next){
    var bno = req.params.bno;

    Board.update({"bno":bno}, {"$inc" : {"hit" : 1}}, function (err, doc) {
        if (err) console.error('err', err);



    Board.findOne({"bno" : bno} , function (err, docs) {
        if (err) console.error('err', err);
        console.log('docs', docs);
        res.render('read', {"title" : "글 조회", "row" : docs});
    });
});
});
//글 수정화면
router.get('/update', function (req, res, next) {
    var bno = req.query.bno;

    Board.findOne({"bno" : bno} , function (err, docs) {
        if (err) console.error('err', err);
        console.log('docs', docs);
        res.render('update', {"title" : "글 수정", "row" : docs});
    });
});

router.post('/update', function (req, res, next) {
    var writer = req.body.writer;
    var title = req.body.title;
    var content = req.body.content;
    var bno = req.body.bno;

    Board.findOneAndUpdate({"bno":bno}, {writer:writer, title:title, content: content}, {upsert:true}, function (err, doc) {
        if(err) return res.send(500, {error: err});
        
        console.log(writer);
        console.log(title);
        console.log("글이 수정되었습니다.");
        res.redirect('/board');
    });
});
//글 삭제
router.post('/delete', function (req, res, next) {
    var bno = req.body.bno;

    Board.find({bno:bno}).remove().exec();
    console.log(bno + "번 글이 삭제되었습니다.");
    //res.send('<script>alert(_id + "번 글이 삭제되었습니다.");</script>');
    res.redirect('/board');
});

//임시데이터
router.get('/write300', function (req, res, next) {
    for(var i=1; i<300; i++){
        var board = new Board({
            "title" : '제목' + i,
            "content" : '내용' + i,
            "writer" : '작성자' + i
        });
        board.save(function (err, doc) {

        });
    }
    res.send('<head><meta charset="utf-8"><script>alert("300개의 글 저장 성공"); location.href="/board"</script></head>')
});
module.exports = router;