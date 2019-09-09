/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var dotenv = require("dotenv");
var mongoose = require("mongoose");

var expect = require("chai").expect;

const Board = require("../models/BoardModel.js");
const Thread = require("../models/ThreadModel.js");

dotenv.config();

const CONNECTION_STRING = process.env.DB;

mongoose
  .connect(CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => console.log("connection succesfull"))
  .catch(err => console.log(err));

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .post(function(req, res) {
      let boardParam = req.body.board;

      let newBoard = new Board({
        title: boardParam
      });

      Board.countDocuments(
        {
          title: boardParam
        },
        function(err, count) {
          if (err) console.log(err);

          if (count > 0) {
            Board.findOne({ title: boardParam }).exec((err, data) => {
              if (err) console.log(err);

              let newThread = new Thread({
                // id from db
                board: data._id,
                text: req.body.text,
                delete_password: req.body.delete_password
              });

              newThread.save(err => {
                if (err) return console.log(err);

                console.log(`adding thread to ${boardParam}`);
                res.redirect(`/b/${boardParam}`);
              });
            });
          } else {
            ///////////////////////////////////////////
            newBoard.save(err => {
              if (err) return console.log(err);

              let newThread = new Thread({
                board: newBoard._id,
                text: req.body.text,
                delete_password: req.body.delete_password
              });

              newThread.save(err => {
                if (err) return console.log(err);

                console.log("done");

                res.redirect(`/b/${boardParam}`);
              });
            });

            //////////////////////////////////////
          }
        }
      );
    })

    .delete(function(req, res) {
      let board = req.body.board;
      let threadId = req.body.thread_id;
      let deletePassword = req.body.delete_password;

      Thread.findById(threadId)
        .populate("board")
        .exec((err, data) => {
          if (err) console.log(err);

          if (data === undefined || data === null) {
            res.send("no matching id");
          } else {
            console.log(data);

            if (data.board.title !== board) {
              res.send("no board with this thread");
            } else {
              if (deletePassword !== data.delete_password) {
                res.send("incorrect password");
              } else {
                Thread.findByIdAndDelete(threadId).exec((err, data) => {
                  if (err) console.log(err);
                  console.log("deleted");
                  res.send("success");
                });
              }
            }
          }
        });
    })

    .put(function(req, res) {
      let ThreadId = req.body.thread_id;
      let board = req.body.board;

      Thread.findById(ThreadId)

        .populate("board")
        .exec((err, data) => {
          if (err) console.log(err);

          if (data === undefined || data === null) {
            res.send("no matching id");
          } else {
            console.log(data);

            if (data.board.title !== board) {
              res.send("no board with this thread");
            } else {
              Thread.findByIdAndUpdate(ThreadId, {
                $set: {
                  reported: true
                }
              }).exec((err, data) => {
                if (err) console.log(err);

                res.send("reported");
              });
            }
          }
        });
    });

  app
    .route("/api/replies/:board")
    .post(function(req, res) {
      let threadId = req.body.thread_id;
      let board = req.body.board;

      let replyText = req.body.text;
      let deletePassword = req.body.delete_password;

      Thread.findById(threadId)
        .populate("board")
        .exec((err, data) => {
          if (data === undefined || data === null) {
            res.send("no matching id");
          } else {
            console.log(data);

            if (data.board.title !== board) {
              res.send("no board with this thread");
            } else {
              Thread.findByIdAndUpdate(threadId, {
                $push: {
                  replies: {
                    text: replyText,
                    //created_on: {type: Date, default: new Date()},
                    delete_password: deletePassword
                    //reported: {type: Boolean, default: false}
                  }
                },
                $set: {
                  bumped_on: new Date()
                }
              }).exec((err, data) => {
                if (err) console.log(err);

                res.redirect(`/b/${board}/${threadId}`);
              });
            }
          }
        });
    })

    .put(function(req, res) {
      let ThreadId = req.body.thread_id;
      let board = req.body.board;
      let replyId = req.body.reply_id;
      

      function isObjDotIdInData(arrOfReplies) {
        console.log("reply iddddd");
        console.log(replyId);
        for (let el of arrOfReplies) {
          console.log("idddddd");
          console.log(el._id);
          //has to be == !
          if (el._id == replyId) return true;
        }
        console.log("nope");
        return false;
      }

     

      Thread.findById(ThreadId)

        .populate("board")
        .exec((err, data) => {
          if (err) console.log(err);

          if (data === undefined || data === null) {
            res.send("no matching thread id");
          } else {
            console.log(data);

            if (data.board.title !== board) {
              res.send("no board with this thread");
            } else if (!isObjDotIdInData(data.replies)) {
              res.send("no matching reply id");
            } else {
              //pure mongobd methods
              Thread.update(
                { _id: ThreadId, "replies._id": replyId },
                {
                  $set: {
                    "replies.$.reported": true
                  }
                }
              ).exec((err, data) => {
                console.log("second data");

                console.log(data);
                if (err) console.log(err);

                res.send("reported");
              });
            }
          }
        });
    })

    .delete(function(req, res) {
      let ThreadId = req.body.thread_id;
      let board = req.body.board;
      let replyId = req.body.reply_id;
      let deletePassword = req.body.delete_password

      

      function isObjDotIdInData(arrOfReplies) {
       
        for (let el of arrOfReplies) {
          
          //has to be '==' !

          if (el._id == replyId) {
            console.log('isObjIdInData == true');
            
            return true;
          };
        }
        console.log("nope");
        return false;

      }

      function isPasswordValid (arrOfReplies) {

        //if (arrOfReplies[arrOfReplies.indexOf(arrOfReplies._id)].delete_password == deletePassword){



        //let indexOfReplyWithQueryId = arrOfReplies.indexOf(arrOfReplies._id);

        let indexOfReplyWithQueryId = -1;

        for (let el of arrOfReplies) {
          if (el._id == replyId) {
            indexOfReplyWithQueryId = arrOfReplies.indexOf(el);

          }
        }


        console.log(indexOfReplyWithQueryId);
        


          if (arrOfReplies[indexOfReplyWithQueryId].delete_password == deletePassword){
          console.log('password correct');
          
          return true;
        } else {
          console.log('password incorrect');
          
          return false
        }

      }

 

      Thread.findById(ThreadId)

        .populate("board")
        .exec((err, data) => {
          if (err) console.log(err);

          if (data === undefined || data === null) {
            res.send("no matching thread id");
          } else {
            console.log(data);

            if (data.board.title !== board) {
              res.send("no board with this thread");
            } else if (!isObjDotIdInData(data.replies)) {
              console.log(data.replies);
              
              res.send("no matching reply id");
            } else if (!isPasswordValid(data.replies)) {
              res.send('wrong password')


            } else {

              //pure mongobd methods
              Thread.updateOne(
                { _id: ThreadId, "replies._id": replyId },
                {
                  $pull: 
                    {replies: {_id: replyId} }
                  
                }
              ).exec((err, data) => {
                console.log("second data");

                console.log(data);
                if (err) console.log(err);

                res.send("success");
              });
            }
          }
        });
    });

};
