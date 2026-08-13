const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const Resource = require("../models/Resource.js");
const Subject = require("../models/Subject.js");

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

// --- Subject management ---
// Subjects used to be a hardcoded list (utils/aktuSubjects.js); they now
// live in the DB so the admin can add new ones from the website without
// touching code.

module.exports.renderSubjectsPage = async (req, res) => {
    const subjects = await Subject.find({}).sort({ year: 1, name: 1 });

    const subjectsByYear = { 1: [], 2: [], 3: [], 4: [] };
    subjects.forEach((s) => {
        if (!subjectsByYear[s.year]) subjectsByYear[s.year] = [];
        subjectsByYear[s.year].push(s);
    });

    res.render("admin/subjects.ejs", { subjectsByYear });
};

module.exports.addSubject = async (req, res) => {
    const { name, year } = req.body;

    if (!name || !name.trim() || !year) {
        req.flash("error", "Please provide both a subject name and a year");
        return res.redirect("/admin/subjects");
    }

    try {
        await Subject.create({ name: name.trim(), year: Number(year) });
        req.flash("success", `"${name.trim()}" added to Year ${year}`);
    } catch (err) {
        if (err.code === 11000) {
            req.flash("error", "That subject already exists for this year");
        } else {
            req.flash("error", "Could not add subject, please check the details");
        }
    }

    res.redirect("/admin/subjects");
};

module.exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    await Subject.findByIdAndDelete(id);
    req.flash("success", "Subject removed");
    res.redirect("/admin/subjects");
};
