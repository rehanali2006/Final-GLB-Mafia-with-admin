

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

    const passwordMatches = await admin.comparePassword(password);
    if (!passwordMatches) {
        admin.password = password; 
        changed = true;
    }

    if (changed) {
        await admin.save();
        console.log(`Admin account (${normalizedEmail}) synced with .env`);
    }
};
