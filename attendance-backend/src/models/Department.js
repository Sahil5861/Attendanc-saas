const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
    },
    title :{
        type: String,
        required:true
    },
    slug: {
        type: String,
        required: true
    },
    status: {
        type:Boolean,
        required: true,
        default: true,
    }
});


module.exports = mongoose.model("Department", departmentSchema);