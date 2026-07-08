const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },

    description:{
        type:String,
        default:""
    },


    type: {
        type:String,
        default: "",
        required: true,
    },

    value: {
        type:String,
        default:true,        
    },

    monthlyPrice:{
        type:Number,
        required:true,
        default:0
    },

    yearlyPrice:{
        type:Number,
        required:true,
        default:0
    },

    status:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
});

module.exports =
mongoose.model(
    "Feature",
    featureSchema
);