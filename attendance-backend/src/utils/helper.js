const Role = require('../models/Role')
const Permission = require("../models/Permission");
const BranchPlanRelation = require('../models/BranchPlanRelation');
const Plan = require('../models/Plan');

const getUserPermissions = async (user)=>{
    try {
        if (!user?.roleId) {
            return [];
        }

        const role = await Role.findById(user?.roleId);

        if (!role) {
            return [];
        }

        const permissions = await Permission.find({
            _id : {$in: role.permissions}
        }).select('name');


        const permission_names = permissions.map((permission) => {
            return permission.name;
        });

        
        return permission_names;
    } catch (error) {
        console.error("Get User Permissions Error:", error);
        return [];
    }
}

const getCurrentPlan = async (user)=>{
    try {
        if((!user?.role) == 'BRANCH_MANAGER'){
            return [];
        }

        const relation = await BranchPlanRelation.findOne({
            branch_id :user?.branchId,
            status : 'active'
        });

        console.log('relation : ', relation);


        if(relation){
            const plan = await Plan.findById(relation?.plan_id).populate('features.feature_id');

            console.log('plan : ', plan);
            if(plan){
                return plan;
            }
        }

    } catch (error) {
        console.error(error)
        return [];        
    }
}


module.exports = {
    getUserPermissions,
    getCurrentPlan
}