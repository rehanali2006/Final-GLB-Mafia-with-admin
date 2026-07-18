const Teacher = require("../models/Teacher.js");

// Render faculty directory, optionally filtered by subject search query
module.exports.renderFacultyPage = async (req, res) => {
    const { subject } = req.query;

    let teachers;
    if (subject && subject.trim() !== "") {
        teachers = await Teacher.find({
            subject: { $regex: subject.trim(), $options: "i" },
        }).sort({ name: 1 });
    } else {
        teachers = await Teacher.find({}).sort({ name: 1 });
    }

    res.render("faculty.ejs", { teachers, subject: subject || "" });
};

module.exports.createTeacher = async (req, res) => {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();

    req.flash("success", "Teacher details added successfully!");
    res.redirect("/faculty");
};

module.exports.deleteTeacher = async (req, res) => {
    const { id } = req.params;
    await Teacher.findByIdAndDelete(id);

    req.flash("success", "Teacher entry removed");
    res.redirect("/faculty");
};
