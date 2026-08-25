const mongoose=require("mongoose");

const notificationSchema=new mongoose.Schema({
    type:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
    },
    unit:{
        type:Number,
    },
    year:{
        type:Number,
        required:true,
    },
    branch:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    notified:{
        type:Boolean,
        default:false,
    },
    date:{
        type:Date,
        default:Date.now,
    }
});


notificationSchema.index({ type:1, subject:1, unit:1, notified:1 });

const Notification=mongoose.model("Notification",notificationSchema);
module.exports=Notification;
