const Resource=require("./models/Resource");
const User =require("./models/user");
const Joi=require("joi");

// Subjects are now managed dynamically by the admin (see models/Subject.js),
// so we no longer hardcode a fixed list of allowed subject names here.
// Whether subject/unit are required at all depends on the resource type:
//   - Notes / Assignment : subject + unit required
//   - PYQ                : subject required, unit NOT required (one PDF covers all units)
//   - Lab Manual / Syllabus : neither subject nor unit required
const resourceSchema=Joi.object({
    type:Joi.string().valid("Notes","Assignment","PYQ","Lab Manual","Syllabus").required(),
    year:Joi.number().min(1).max(4).required(),
    branch:Joi.string().valid("CS-AIML","CSE","AI-DS","AI-ML","CS-H","IT","ECE","CS-AI","CS-DS","ME","EEE").required(),
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
