const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },

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
    required: true
  },
  replies: [
    {
      text: { type: String, required: true },
      created_on: { type: Date, default: new Date() },
      delete_password: { type: String, required: true },
      reported: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("Thread", ThreadSchema);
