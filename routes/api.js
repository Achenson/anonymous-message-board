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

      
    })


    app
      .route("/api/replies/:board")
      .post (function (req, res) {

        let threadId = req.body.thread_id;
        let board = req.body.board;

        let replyText = req.body.text;
        let deletePassword = req.body.delete_password;


        Thread.findById(threadId)
          .populate('board')
          .exec( (err, data) => {
              
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
                  delete_password: deletePassword,
                  //reported: {type: Boolean, default: false}
                }
              }

            })
              .exec( (err,data) => {
                if (err) console.log(err);

                res.send('OK')


                
              })


            



          }




          }

          })








        })

};
