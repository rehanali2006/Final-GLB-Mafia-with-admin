const express = require("express");
const router = express.Router();

const {
    renderFeePage,
    saveFee,
    deleteFee,
} = require("../controllers/fee.js");

const { isAuthenticated } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/", wrapAsync(renderFeePage));

// Adding/updating fee details requires login, same as adding a resource
router.post("/", isAuthenticated, wrapAsync(saveFee));

router.delete("/:id", isAuthenticated, wrapAsync(deleteFee));

module.exports = router;
