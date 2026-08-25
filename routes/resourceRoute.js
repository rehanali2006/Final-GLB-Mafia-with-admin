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
