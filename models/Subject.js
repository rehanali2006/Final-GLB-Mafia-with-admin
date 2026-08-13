const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        min: 1,
        max: 4,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Prevent the same subject name being added twice for the same year
subjectSchema.index({ year: 1, name: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
