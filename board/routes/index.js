var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//DB연결
mongoose.createConnection('mongodb://localhost/tutorial', function (error) {
  if(error){
    console.log(error);
  }else{
    console.log("mongo연결 성공")
  }
});
var Schema = mongoose.Schema;
var boardSchema = new Schema({
  _id: String,
  title: String,
  content: String,
  writer: String,
  date: {
    type: Date,
    default: Date.now
  }
});

var Board = mongoose.model('board', boardSchema);

router.get('/', function(req,res,next){
  Board.find({}, function (err, rows) {
    if (err) console.error("err : " + err);
    console.log("rows : " + JSON.stringify(rows));
    res.render('index', {title: 'test', rows: rows});
    //console.log(rows);
    //res.json(rows);
  });
});

module.exports = router;