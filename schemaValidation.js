const Resource=require("./models/Resource");
const User =require("./models/user");
const Joi=require("joi");

// Subjects are now managed dynamically by the admin (see models/Subject.js),
// so we no longer hardcode a fixed list of allowed subject names here.
// Whether subject/unit/branch are required depends on the resource type:
//   - Notes / Assignment    : branch + subject + unit required
//   - PYQ                   : subject required; branch and unit NOT required
//                             (PYQs are the same across every branch, and one
//                             PDF covers all units)
//   - Lab Manual / Syllabus : branch required, subject/unit NOT required
const resourceSchema=Joi.object({
    type:Joi.string().valid("Notes","Assignment","PYQ","Lab Manual","Syllabus").required(),
    year:Joi.number().min(1).max(4).required(),
    branch:Joi.when("type",{
        is:"PYQ",
        then:Joi.string().valid("CS-AIML","CSE","AI-DS","AI-ML","CS-H","IT","ECE","CS-AI","CS-DS","ME","EEE").allow("", null).optional(),
        otherwise:Joi.string().valid("CS-AIML","CSE","AI-DS","AI-ML","CS-H","IT","ECE","CS-AI","CS-DS","ME","EEE").required(),
    }),
    section: Joi.string()
    .pattern(/^[A-Z]$/)
    .allow("", null),
    subject:Joi.when("type",{
        is:Joi.valid("Notes","Assignment","PYQ"),
        then:Joi.string().required(),
        otherwise:Joi.string().allow("", null).optional(),
    }),
    views:Joi.number().default(1),
    unit:Joi.when("type",{
        is:Joi.valid("Notes","Assignment"),
        then:Joi.number().min(1).max(5).required(),
        otherwise:Joi.number().allow("", null).optional(),
    }),
    date:Joi.date(),
    // file is handled by multer (multipart upload), not submitted as plain text body
    file:Joi.string().allow("", null).optional(),
    owner: Joi.string().hex().length(24),
})


const loginSchema=Joi.object({
    email:Joi.string().required(),
    password:Joi.string().min(6).required(),
})

const signupSchema=Joi.object({
    username:Joi.string().required(),
    email:Joi.string().required(),
    password:Joi.string().min(6).required(),
    role:Joi.string().valid("user","admin"),
})

module.exports={resourceSchema,loginSchema,signupSchema};
