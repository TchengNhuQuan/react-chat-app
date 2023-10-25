const mongoose = require("mongoose");

const badWordsSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    min: 3,
    unique: true,
  },
});

module.exports = mongoose.model("BadWords", badWordsSchema);
