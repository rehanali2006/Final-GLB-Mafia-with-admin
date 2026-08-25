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


router.route("/login")
    .get(renderAdminLoginPage)
    .post(wrapAsync(adminLogin));

router.get(
    "/dashboard",
    isAuthenticated,
    isAdmin,
    wrapAsync(renderAdminDashboard)
);


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
