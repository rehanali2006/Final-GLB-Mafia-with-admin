const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        // subject(s) taught, used for searching e.g. "Data Structures"
    },
    designation: {
        type: String,
        trim: true,
        // e.g. Assistant Professor, HOD (optional)
    },
    yearsOfTeaching: {
        type: Number,
        required: true,
        min: 0,
        // how many years he/she has been teaching
    },
    block: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
        // block building - A or B (added C/D in case college expands)
    },
    officeFloor: {
        type: String,
        required: true,
        trim: true,
        // e.g. "2nd Floor"
    },
    cabinNumber: {
        type: String,
        required: true,
        trim: true,
        // e.g. "B-204"
    },
});

teacherSchema.index({ subject: 1, name: 1 });

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
