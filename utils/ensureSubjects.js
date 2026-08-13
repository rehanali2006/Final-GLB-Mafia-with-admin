// Seeds the Subject collection from the old hardcoded aktuSubjects list,
// but only the very first time (i.e. if no subjects exist yet in the DB).
// After that, subjects are fully managed by the admin from /admin/subjects.

const Subject = require("../models/Subject.js");
const aktuSubjects = require("./aktuSubjects.js");

module.exports.ensureSubjects = async function ensureSubjects() {
    const count = await Subject.countDocuments();
    if (count > 0) return;

    const docs = [];
    for (const year in aktuSubjects) {
        for (const name of aktuSubjects[year]) {
            docs.push({ year: Number(year), name });
        }
    }

    if (docs.length === 0) return;

    try {
        await Subject.insertMany(docs, { ordered: false });
        console.log(`Seeded ${docs.length} subjects into the database.`);
    } catch (err) {
        console.log("Subject seeding finished with some skips:", err.message);
    }
};
