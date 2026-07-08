const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
{
    companyName:{
        type:String,
        required:true,
        trim:true
    },

    companyCode:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },

    ownerName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    phone:{
        type:String,
        required:true
    },

    gst:{
        type: String,
        required:false
    },

    address:{
        type:String,
        default:""
    },
    
    city: {
      type: String,
      required: false,
      trim: true,
    },

    state: {
      type: String,
      required: false,
      trim: true,
    },

    adminUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },

    status:{
        type:Boolean,
        default:true
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
});

module.exports = mongoose.model(
    "Company",
    companySchema
);