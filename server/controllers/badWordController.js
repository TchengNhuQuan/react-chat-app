const BadWords = require("../models/badWordsModel");

module.exports.getBadWords = async (req, res, next) => {
  try {
    const badWords = await BadWords.find({})
    res.json(badWords);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addBadWords = async (req, res, next) => {
  try {
    const { word } = req.body;
    const data = await BadWords.create({
        word: word
    });

    if (data) return res.json({ msg: "Bad words added successfully." });
    else return res.json({ msg: "Failed to add bad words to the database" });
  } catch (ex) {
    next(ex);
  }
};
