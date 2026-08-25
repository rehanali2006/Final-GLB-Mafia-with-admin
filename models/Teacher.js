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
    },
    designation: {
        type: String,
        trim: true,
    },
    yearsOfTeaching: {
        type: Number,
        required: true,
        min: 0,
    },
    block: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
    },
    officeFloor: {
        type: String,
        required: true,
        trim: true,
    },
    cabinNumber: {
        type: String,
        required: true,
        trim: true,
    },
});

teacherSchema.index({ subject: 1, name: 1 });

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
