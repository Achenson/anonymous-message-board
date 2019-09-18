"use strict";

var dotenv = require("dotenv");
var mongoose = require("mongoose");

var expect = require("chai").expect;

const Board = require("../models/BoardModel.js");
const Thread = require("../models/ThreadModel.js");

const bcrypt = require("bcrypt");
const saltRounds = 10;

dotenv.config();

const CONNECTION_STRING = process.env.DB;

mongoose
  .connect(CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => console.log("connection succesfull"))
  .catch(err => console.log(err));

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .get(function(req, res) {
      let board = req.params.board;
      console.log("board name");

      console.log(board);

      //geting id from Board (because in the Thread Model there is only board._id)
      Board.findOne({ title: board }).exec((err, data) => {
        if (err) console.log(err);

        let boardId = data._id;

        Thread.find({ board: boardId })

          //populating board, to get board.title in board.html
          .populate("board")
          .select(
            "_id created_on bumped_on text board replies._id replies.text replies.created_on"
          )
          .sort({ bumped_on: -1 })
          .limit(10)
          .exec((err, data) => {
            if (err) console.log(err);
            //sorting replies in each thread
            for (let el of data) {
              el.replies.sort((a, b) => {
                if (a.created_on < b.created_on) {
                  return 1;
                }
                if (a.created_on > b.created_on) {
                  return -1;
                }

                return 0;
              });
            }
            //getting only 3 recent replies
            for (let el of data) {
              el.replies.splice(3, el.replies.length - 3);
            }

            res.json(data);
          });
      });
    })

    .post(function(req, res) {
      // let boardParam = req.body.board;
      let boardParam = req.params.board;
      let passwordToHash = req.body.delete_password;

      let newBoard = new Board({
        title: boardParam
      });

      Board.countDocuments(
        {
          title: boardParam
        },
        function(err, count) {
          if (err) console.log(err);
          //if the board is already in the db
          if (count > 0) {
            Board.findOne({ title: boardParam }).exec((err, data) => {
              if (err) console.log(err);

              let myHash = "";

              bcrypt.hash(passwordToHash, saltRounds).then(function(hash) {
                myHash = hash;

                let newThread = new Thread({
                  // id from db
                  board: data._id,
                  text: req.body.text,
                  delete_password: myHash
                });

                newThread.save(err => {
                  if (err) return console.log(err);

                  console.log(`adding thread to ${boardParam}`);
                  res.redirect(`/b/${boardParam}/`);
                });
              });
            });

            // if there no board in db with this name
          } else {
            //async function needed, so that when the page redirects,
            // the new data is in the db already
            asyncBoard();

            async function asyncBoard() {
              let boardPromise = new Promise((resolve, reject) => {
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

                    resolve("saved");
                  });
                });
              });

              let boardPromiseResolve = await boardPromise;

              if (boardPromiseResolve === "saved") {
                res.redirect(`/b/${boardParam}/`);
              } else {
                console.log("board not saved");
                res.send("board not saved");
              }
            }
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
              bcrypt
                .compare(deletePassword, data.delete_password)
                .then(function(hashRes) {
                  if (hashRes != true) {
                    res.send("incorrect password");
                  } else {
                    Thread.findByIdAndDelete(threadId).exec((err, data) => {
                      if (err) console.log(err);
                      console.log("deleted");
                      res.send("success");
                    });
                  }
                });
            }
          }
        });
    })

    .put(function(req, res) {
      // if req.body.report_id (as is named in thread.html) is null or undefined
      //then ThreadId becomes the value of req.body.thread_id (as it is named in board.html)
      let ThreadId = req.body.report_id || req.body.thread_id;
      let board = req.body.board;
      //let board = req.params.board;

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
    .get(function(req, res) {
      // e.g. /api/replies/new board?thread_id=5d76531f4365ca07c8014ed3

      let board = req.params.board;

      console.log("board");
      console.log(board);

      let threadId = req.query.thread_id;

      //geting id from Board (because only board._id is in Thread Model)
      Board.findOne({ title: board }).exec((err, data) => {
        if (err) console.log(err);

        let boardId = data._id;
        //only to ensure that correct board name was passed to the URL
        Thread.findOne({ board: boardId, _id: threadId })
          .populate("board")
          .select(
            "_id created_on bumped_on text replies._id replies.text replies.created_on"
          )

          .exec((err, data) => {
            if (err) console.log(err);

            data.replies.sort((a, b) => {
              if (a.created_on < b.created_on) {
                return 1;
              }
              if (a.created_on > b.created_on) {
                return -1;
              }

              return 0;
            });

            res.json(data);
          });
      });
    })

    .post(function(req, res) {
      let threadId = req.body.thread_id;

      console.log(threadId);
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
              let myHash = "";

              bcrypt.hash(deletePassword, saltRounds).then(function(hash) {
                myHash = hash;

                Thread.findByIdAndUpdate(threadId, {
                  $push: {
                    replies: {
                      text: replyText,
                      //created_on: {type: Date, default: new Date()},
                      //delete_password: deletePassword
                      delete_password: hash
                      //reported: {type: Boolean, default: false}
                    }
                  },

                  $set: {
                    bumped_on: new Date()
                  }
                }).exec((err, data) => {
                  if (err) console.log(err);

                  res.redirect(`/b/${board}/${threadId}/`);
                });
              });
            }
          }
        });
    })

    .put(function(req, res) {
      let ThreadId = req.body.thread_id;
      let board = req.body.board;
      let replyId = req.body.reply_id;

      // checking array of replies in a thread,
      // checking if replyId matches any el of the array of replies
      function isObjDotIdInData(arrOfReplies) {
        console.log("reply id");
        console.log(replyId);
        for (let el of arrOfReplies) {
          console.log("id");
          console.log(el._id);
          //has to be '==', not working otherwise !
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
              //pure mongodb methods
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
      let deletePassword = req.body.delete_password;

      /*
      logic summary here:
      0. ... checking  threadId, board & replyId
1. async function deleteReply() runs
2. awaits promise -> when async function isPasswordValid(data.replies) resolves
3. isPasswordValid -> promise zwraca true or false; resolve for this promise is inside another promise
chained with then (to check if password is correct)
4. following logic in deleteReply() depends on if isPasswordValid return true or false
      */

      function isObjDotIdInData(arrOfReplies) {
        for (let el of arrOfReplies) {
          //has to be '==' !
          if (el._id == replyId) {
            console.log("isObjIdInData == true");
            return true;
          }
        }
        console.log("nope");
        return false;
      }
      // argument is the array of Replies, which is later searched by _id
      async function isPasswordValid(arrOfReplies) {
        let promise = new Promise((resolve, reject) => {
          let indexOfReplyWithQueryId = -1;

          for (let el of arrOfReplies) {
            if (el._id == replyId) {
              indexOfReplyWithQueryId = arrOfReplies.indexOf(el);
            }
          }

          //hash logic below
          bcrypt
            .compare(
              deletePassword,
              arrOfReplies[indexOfReplyWithQueryId].delete_password
            )
            .then(function(hashRes) {
              if (hashRes != true) {
                console.log("password incorrect");
                resolve(false);
              } else {
                console.log("password correct");
                resolve(true);
              }
            });
        });
        //will return either true or false
        let awaitPromise = await promise;
        console.log("await promise");

        console.log(awaitPromise);

        return awaitPromise;
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
            } else {
              async function deleteReply() {
                let finalPromise = new Promise((resolve, reject) => {
                  resolve(isPasswordValid(data.replies));
                });

                let awaitingFinalPromise = await finalPromise;
                console.log("awaitingFinalPromise");
                console.log(awaitingFinalPromise);

                if (!awaitingFinalPromise) {
                  res.send("wrong password");
                } else {
                  //pure mongobd methods
                  Thread.update(
                    { _id: ThreadId, "replies._id": replyId },
                    {
                      //!!!!!!!!!!! mongodb: $(update) looking for the property
                      // "text" in an array
                      $set: {
                        "replies.$.text": "[deleted]"
                      }
                    }
                  ).exec((err, data) => {
                    console.log("second data");

                    console.log(data);
                    if (err) console.log(err);

                    res.send("success");
                  });
                }
              }

              deleteReply();
            }
          }
        });
    });
};
