const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const Resource = require("../models/Resource.js");

const isProduction = process.env.NODE_ENV === "production";

function setTokenCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

module.exports.renderAdminLoginPage = (req, res) => {
    res.render("admin/login.ejs");
};

// Admin logs in here - there is no signup route for this account.
module.exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await User.findOne({
        email: (email || "").toLowerCase().trim(),
        role: "admin",
    });

    if (!admin || !(await admin.comparePassword(password))) {
        req.flash("error", "Invalid admin credentials");
        return res.redirect("/admin/login");
    }

    const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    setTokenCookie(res, token);
    req.flash("success", "Welcome back, admin!");
    res.redirect("/admin/dashboard");
};

module.exports.renderAdminDashboard = async (req, res) => {
    const resources = await Resource.find({})
        .sort({ date: -1 })
        .populate("owner", "username email");

    res.render("admin/dashboard.ejs", { resources });
};
