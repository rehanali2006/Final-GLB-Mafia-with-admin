const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isAuthenticated, isAdmin } = require("../middleware.js");
const {
    renderAdminLoginPage,
    adminLogin,
    renderAdminDashboard,
    renderSubjectsPage,
    addSubject,
    deleteSubject,
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

// Subject management - lets the admin add/remove subjects (Notes,
// Assignment and PYQ are organised by subject) without touching code.
router.route("/subjects")
    .get(isAuthenticated, isAdmin, wrapAsync(renderSubjectsPage))
    .post(isAuthenticated, isAdmin, wrapAsync(addSubject));

router.delete(
    "/subjects/:id",
    isAuthenticated,
    isAdmin,
    wrapAsync(deleteSubject)
);

module.exports = router;
