const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isAuthenticated, isAdmin } = require("../middleware.js");
const {
    renderAdminLoginPage,
    adminLogin,
    renderAdminDashboard,
} = require("../controllers/admin.js");

// Admin login only - deliberately no /admin/signup route.
// The one admin account is provisioned from .env (see utils/ensureAdmin.js).
router.route("/login")
    .get(renderAdminLoginPage)
    .post(wrapAsync(adminLogin));

router.get(
    "/dashboard",
    isAuthenticated,
    isAdmin,
    wrapAsync(renderAdminDashboard)
);

module.exports = router;
