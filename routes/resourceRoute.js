const express=require("express");
const router=express.Router({mergeParams:true});

const {
    renderUnitPage,
    viewResourcePage,
    viewPage,
    deleteResource,
    subscribeNotification,
}=require("../controllers/resource.js");

const wrapAsync=require("../utils/wrapAsync.js");

const {
    isAuthenticated,
    isOwnerOrAdmin
}=require("../middleware.js");

router.get("/view/:id",wrapAsync(viewPage));

router.get("/:type/:subject",wrapAsync(renderUnitPage));

router.get(
    "/:type/:subject/:unit",
    wrapAsync(viewResourcePage)
);

router.delete(
    "/delete/:id",
    isAuthenticated,
    isOwnerOrAdmin,
    wrapAsync(deleteResource)
);

// Notify me when resource is uploaded
// Express 5 no longer supports the ":name?" optional-param syntax, so we
// register one explicit route per combination instead:
//   Notes / Assignment -> /notify/:type/:subject/:unit
//   PYQ                -> /notify/:type/:subject
//   Lab Manual/Syllabus -> /notify/:type
router.post(
    "/notify/:type/:subject/:unit",
    isAuthenticated,
    wrapAsync(subscribeNotification)
);

router.post(
    "/notify/:type/:subject",
    isAuthenticated,
    wrapAsync(subscribeNotification)
);

router.post(
    "/notify/:type",
    isAuthenticated,
    wrapAsync(subscribeNotification)
);

module.exports=router;
