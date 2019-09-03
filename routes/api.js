/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var dotenv = require("dotenv");
var mongoose = require("mongoose");

var expect = require('chai').expect;

dotenv.config();


const CONNECTION_STRING = process.env.DB;

mongoose
  .connect(CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => console.log("connection succesfull"))
  .catch(err => console.log(err));



module.exports = function (app) {



  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
