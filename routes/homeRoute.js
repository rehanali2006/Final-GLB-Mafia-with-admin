const express=require("express");
const router=express.Router({mergeParams:true});

const {
    renderBranchPage,
    renderHomePage,
    renderNewResourcePage,
    renderResourceTypePage,
    renderSubjectPage,
    renderPYQSubjectPage,
    createNewResource
}=require("../controllers/resource.js");

const {
    isAuthenticated,
    validateResource
}=require("../middleware.js");

const { upload } = require("../cloudinary.js");

const wrapAsync=require("../utils/wrapAsync.js");

router.route("/new")
.get(isAuthenticated,wrapAsync(renderNewResourcePage))
.post(
    isAuthenticated,
    upload.single("file"),   validateResource,
    wrapAsync(createNewResource)
);

router.get("/",renderHomePage);

router.get("/:year",renderBranchPage);

router.get("/:year/pyq",wrapAsync(renderPYQSubjectPage));

router.get("/:year/:branch",renderResourceTypePage);

router.get("/:year/:branch/:type",wrapAsync(renderSubjectPage));

module.exports=router;
