const { addBadWords, getBadWords } = require("../controllers/badWordController");
const router = require("express").Router();

router.post("/addbadwords/", addBadWords);
router.post("/getbadwords/", getBadWords);

module.exports = router;
