// Creates (or syncs) the ONE admin account from environment variables.
// There is no signup form for this - it's provisioned here at server
// startup, and logged into via the separate /admin/login page.
//
// Add these to your .env file:
//   ADMIN_EMAIL=you@example.com
//   ADMIN_PASSWORD=some-strong-password
//   ADMIN_USERNAME=admin           (optional, defaults to "admin")

const User = require("../models/user.js");

module.exports.ensureAdmin = async function ensureAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME || "admin";

    if (!email || !password) {
        console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set in .env - skipping admin account setup.");
        return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let admin = await User.findOne({ email: normalizedEmail });

    if (!admin) {
        admin = new User({
            username,
            email: normalizedEmail,
            password,
            role: "admin",
        });
        await admin.save();
        console.log(`Admin account created for ${normalizedEmail}`);
        return;
    }

    let changed = false;

    if (admin.role !== "admin") {
        admin.role = "admin";
        changed = true;
    }

    // Keep the admin's password in sync with .env, in case it was changed there
    const passwordMatches = await admin.comparePassword(password);
    if (!passwordMatches) {
        admin.password = password; // pre-save hook rehashes it
        changed = true;
    }

    if (changed) {
        await admin.save();
        console.log(`Admin account (${normalizedEmail}) synced with .env`);
    }
};
