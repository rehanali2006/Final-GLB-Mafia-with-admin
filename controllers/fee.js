const Fee = require("../models/Fee.js");

module.exports.renderFeePage = async (req, res) => {
    const fees = await Fee.find({}).sort({ year: 1 });
    res.render("feeStructure.ejs", { fees });
};

// Adds a new year's fee, or updates it if that year already exists
module.exports.saveFee = async (req, res) => {
    const { year, collegeFee, hostelFee } = req.body;

    await Fee.findOneAndUpdate(
        { year: Number(year) },
        {
            year: Number(year),
            collegeFee: Number(collegeFee),
            hostelFee: Number(hostelFee) || 0,
        },
        { upsert: true, new: true, runValidators: true }
    );

    req.flash("success", "Fee details saved!");
    res.redirect("/fee-structure");
};

module.exports.deleteFee = async (req, res) => {
    const { id } = req.params;
    await Fee.findByIdAndDelete(id);

    req.flash("success", "Fee entry removed");
    res.redirect("/fee-structure");
};
