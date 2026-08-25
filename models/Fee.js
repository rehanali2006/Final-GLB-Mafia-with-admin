const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    // 1st / 2nd / 3rd / 4th year
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
        unique: true,
        
    },
    // total college fee for that year
    collegeFee: {
        type: Number,
        required: true,
        min: 0,
        
    },
    // total hostel fee for that year 
    hostelFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        
    },
});

const Fee = mongoose.model("Fee", feeSchema);
module.exports = Fee;
