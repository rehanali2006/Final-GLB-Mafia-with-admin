const express = require("express");
const router = express.Router();

const { renderAboutPage } = require("../controllers/pages.js");

router.get("/", renderAboutPage);

module.exports = router;
