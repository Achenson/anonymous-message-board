const mongoose = require('mongoose');



const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  threads: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Thread'
  }]
})





const ThreadSchema  = new mongoose.Schema({
  board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'

  },

  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    required: true,
    default: new Date()
  },
  bumped_on: {
    type: Date,
    required: true,
    default: new Date()
  },
  reported: {
    type: Boolean,
    required: true,
    default: false
  },
  delete_password: {
    type: String,
    required: true,
    
  },
  replies: [{
    text: String,
    created_on: {type: Date, default: new Date()},
    delete_password: String,
    reported: {type: Boolean, default: false}

  }]

})  


const Board = mongoose.model('Board', BoardSchema);

const Thread = mongoose.model('Thread', ThreadSchema);
