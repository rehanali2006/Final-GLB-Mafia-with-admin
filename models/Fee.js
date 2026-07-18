const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
        unique: true,
        // 1st / 2nd / 3rd / 4th year
    },
    collegeFee: {
        type: Number,
        required: true,
        min: 0,
        // total college fee for that year
    },
    hostelFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        // total hostel fee for that year (0 if not applicable / day scholar)
    },
});

const Fee = mongoose.model("Fee", feeSchema);
module.exports = Fee;
