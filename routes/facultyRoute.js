const express = require("express");
const router = express.Router();

const {
    renderFacultyPage,
    createTeacher,
    deleteTeacher,
} = require("../controllers/teacher.js");

const { isAuthenticated } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/", wrapAsync(renderFacultyPage));


router.post("/", isAuthenticated, wrapAsync(createTeacher));

router.delete("/:id", isAuthenticated, wrapAsync(deleteTeacher));

module.exports = router;
