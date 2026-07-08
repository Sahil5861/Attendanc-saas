const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    // features: [
    //     {
    //         type:
    //             mongoose.Schema.Types.ObjectId,

    //         ref: "Feature"
    //     }
    // ],

    features : [
        {
            feature_id : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Feature',
                required: true,
            },
            type :{
                type:String,
                required:true,                   
            },
            limit: {
                type:String,
                default: ""
            },
        }
    ],


    monthlyPrice: {
        type: Number,
        default: 0
    },

    yearlyPrice: {
        type: Number,
        default: 0
    },

    isCustom: {
        type: Boolean,
        default: false
    },

    company_id :{
        type: String,
        default:"",
    },

    branch_id :{
        type: String,
        default:"",
    },

    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model
(
    "Plan",
    planSchema
);