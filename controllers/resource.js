const Resource=require("../models/Resource.js");
const Subject=require("../models/Subject.js");
const Notification=require("../models/Notification.js");
const { cloudinary } = require("../cloudinary.js");
const {getIo,getOnlineUsers}=require("../socket.js");
const { analyzePdf } = require("../utils/vision.js");

const client=require("../redis.js");


async function runContentAnalysis(resourceId, fileUrl){
    try{
        const result = await analyzePdf(fileUrl);

        if(result===null){
            await Resource.findByIdAndUpdate(resourceId,{analysisStatus:"skipped"});
            return;
        }

        await Resource.findByIdAndUpdate(resourceId,{
            keywords:result.keywords,
            extractedText:result.text,
            analysisStatus:"done",
        });


        await client.flushDb().catch(()=>{});
    }catch(err){
        console.error("Content analysis (Vision API) failed:",err.message);
        await Resource.findByIdAndUpdate(resourceId,{analysisStatus:"failed"}).catch(()=>{});
    }
}

const NO_SUBJECT_TYPES=["Lab Manual","Syllabus"];

const NO_UNIT_TYPES=["PYQ","Lab Manual","Syllabus"];

function constructKey(req){
    const baseUrl=req.path.replace(/^\/+|\/+$/g,'').replace(/\//g,':');
    return baseUrl;
}

module.exports.renderHomePage=(req,res)=>{
    res.render("home.ejs");
}

module.exports.renderBranchPage=(req,res)=>{
    let {year}=req.params;
    res.render("chooseBranch.ejs",{year});
}

module.exports.renderResourceTypePage=(req,res)=>{
    let {year,branch}=req.params;
    res.render("chooseResourceType.ejs",{year,branch});
}

module.exports.renderPYQSubjectPage=async(req,res)=>{
    let {year}=req.params;
    let currentYearSubjects = await Subject.find({year:Number(year)}).sort({name:1});
    res.render("chooseSubject.ejs",{year,branch:null,type:"PYQ",currentYearSubjects});
}


module.exports.renderSubjectPage=async(req,res)=>{
    let{year,branch,type}=req.params;

    if(NO_SUBJECT_TYPES.includes(type)){
        const key=constructKey(req);
        const cached=await client.get(key);

        if(cached){
            const resources=JSON.parse(cached);
            return res.render("viewResources.ejs",{resources,type,year,branch,subject:null,unit:null});
        }

        let resources=await Resource.find({
            type,
            year:Number(year),
            branch,
        }).sort({views:-1}).populate("owner","username");

        if(resources.length>0){
            await client.set(key,JSON.stringify(resources),{EX:1000,NX:true});
        }

        return res.render("viewResources.ejs",{resources,type,year,branch,subject:null,unit:null});
    }

    let currentYearSubjects = await Subject.find({year:Number(year)}).sort({name:1});
    res.render("chooseSubject.ejs",{year,branch,type,currentYearSubjects});
}

module.exports.renderUnitPage=async(req,res)=>{
    let {type,subject}=req.params;
    subject = decodeURIComponent(subject);

    if(NO_UNIT_TYPES.includes(type)){
        const key=constructKey(req);
        const cached=await client.get(key);

        if(cached){
            const resources=JSON.parse(cached);
            return res.render("viewResources.ejs",{resources,type,subject,unit:null});
        }

        let resources=await Resource.find({
            type,
            subject,
        }).sort({views:-1}).populate("owner","username");

        if(resources.length>0){
            await client.set(key,JSON.stringify(resources),{EX:1000,NX:true});
        }

        return res.render("viewResources.ejs",{resources,type,subject,unit:null});
    }

    res.render("chooseUnit.ejs",{type,subject});
}

module.exports.viewResourcePage=async(req,res)=>{
    let{type,subject,unit}=req.params;

    const decodedSubject=decodeURIComponent(subject);

    const key=constructKey(req);
    const data = await client.get(key);

    if(data){
        const resources=JSON.parse(data);
        return res.render("viewResources.ejs",{resources,type,subject:decodedSubject,unit});
    }

    let resources=await Resource.find({
        type:type,
        unit:Number(unit),
        subject:decodedSubject,
    }).sort({views:-1}).populate("owner","username");

    if(resources.length===0){
        return res.render("viewResources.ejs",{resources,type,subject:decodedSubject,unit});
    }

    await client.set(key,JSON.stringify(resources),{
      EX:1000,
      NX:true,
    });

    return res.render("viewResources.ejs",{resources,type,subject:decodedSubject,unit});
}

module.exports.viewPage=async (req, res) => {
    let { id } = req.params;
    let resource = await Resource.findByIdAndUpdate(id,{$inc:{views:1}},{returnDocument:"after"})
        .populate("owner","username");
    if(!resource){
        req.flash("error","Some error occured, Try again!!");
        return res.redirect("/home");
    }
    res.render("view.ejs",{resource});
}

module.exports.renderNewResourcePage=async(req,res)=>{
    const subjects = await Subject.find({}).sort({year:1,name:1});
    const subjectsByYear = {1:[],2:[],3:[],4:[]};
    subjects.forEach(s=>{
        if(!subjectsByYear[s.year]) subjectsByYear[s.year]=[];
        subjectsByYear[s.year].push(s.name);
    });
    res.render("newResource.ejs",{subjectsByYear});
}


module.exports.createNewResource=async(req,res)=>{
    if (!req.file) {
        req.flash("error", "Please upload a PDF file");
        return res.redirect("/home/new");
    }

    const body={...req.body};

    if(!body.subject) delete body.subject;
    if(!body.unit) delete body.unit;
    if(!body.branch) delete body.branch;

    const newResource = new Resource(body);
    newResource.owner = req.userId;
    newResource.file = req.file.path;
    newResource.cloudinaryId = req.file.filename;

    await newResource.save();
    await client.flushDb();
    runContentAnalysis(newResource._id, newResource.file);

    const notifQuery={
        type:newResource.type,
        notified:false,
    };
    if(newResource.subject) notifQuery.subject=newResource.subject;
    if(newResource.unit) notifQuery.unit=newResource.unit;

    const pendingNotifications=await Notification.find(notifQuery);

    if(pendingNotifications.length>0){
        const io=getIo();
        const onlineUsers=getOnlineUsers();

        let message=`A new ${newResource.type}`;
        if(newResource.subject) message+=` for ${newResource.subject}`;
        if(newResource.unit) message+=` Unit ${newResource.unit}`;
        message+=` has been uploaded!`;

        for(const notif of pendingNotifications){
            const userId=notif.user.toString();
            const socketId=onlineUsers.get(userId);

            if(socketId){
                io.to(socketId).emit("resourceUploaded",{
                    message,
                    type:newResource.type,
                    subject:newResource.subject,
                    unit:newResource.unit,
                });
            }

            notif.notified=true;
            await notif.save();
        }
    }


    req.flash("success", "Resource uploaded successfully!");
    res.redirect("/");
}

module.exports.deleteResource=async(req,res)=>{
    let {id}=req.params;
    const resource = await Resource.findById(id);
    if (resource && resource.cloudinaryId) {
        await cloudinary.uploader.destroy(resource.cloudinaryId, { resource_type: "raw" });
    }
    await Resource.findByIdAndDelete(id);
    await client.flushDb();
    res.redirect("/");
}

module.exports.subscribeNotification=async(req,res)=>{
    const {type}=req.params;

    const subject = req.params.subject ? decodeURIComponent(req.params.subject) : undefined;
    const unit = req.params.unit ? Number(req.params.unit) : undefined;

    const {year,branch}=req.body;

    const existingQuery={
        type,
        user:req.userId,
        notified:false,
    };
    if(subject) existingQuery.subject=subject;
    if(unit) existingQuery.unit=unit;

    const existing=await Notification.findOne(existingQuery);

    if(existing){
        req.flash("error","You are already subscribed for this resource");
        return res.redirect("/home");
    }

    const newNotification=new Notification({
        type,
        subject,
        unit,
        year:Number(year)||1,
        branch:branch||"CSE",
        user:req.userId,
    });

    await newNotification.save();
    req.flash("success","You will be notified when this resource is uploaded!");
    res.redirect("/home");
}
