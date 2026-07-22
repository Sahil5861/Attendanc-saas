const User = require("../../models/User");
const BranchSubscription = require("../../models/BranchSubscription");


exports.getSubscriptions = async(req, res) => {
    try{
        const subscriptions = await BranchSubscription.find({})
        .populate('branch_id')
        .populate('plan_id')
        .sort({createdAt: -1});


        return res.status(200).json({
            success: true, 
            data: subscriptions
        });
    }
    catch(error){
        return res.status(500).json({
            success: false, message: error.mesage
        });
    }
}