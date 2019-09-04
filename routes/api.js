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

/*

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var authorSchema = Schema({
  name    : String,
  stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
  author : { type: Schema.Types.ObjectId, ref: 'Author' },
  title    : String
});

var Story  = mongoose.model('Story', storySchema);
var Author = mongoose.model('Author', authorSchema);


*/

module.exports = function(app) {
  /*

var bob = new Author({ name: 'Bob Smith' });

bob.save(function (err) {
  if (err) return handleError(err);

  //Bob now exists, so lets create a story
  var story = new Story({
    title: "Bob goes sledding",
    author: bob._id    // assign the _id from the our author Bob. This ID is created by default!
  });

  story.save(function (err) {
    if (err) return handleError(err);
    // Bob now has his story
  });
});


*/

  app.route("/api/threads/:board").post(function(req, res) {
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
  });

  app.route("/api/replies/:board");
};
