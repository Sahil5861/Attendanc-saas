const Feature = require("../../models/Feature");
const Plan = require("../../models/Plan");
const Permission = require("../../models/Permission");
const mongoose = require('mongoose');

const Company = require('../../models/Company');
const Employee = require('../../models/Employee');
const Branch = require("../../models/Branch");
const Role = require("../../models/Role");
const BranchPlanRelation = require("../../models/BranchPlanRelation");
const Attendance = require("../../models/Attendance");


exports.getSuperAdminData = async (req, res) => {
    try {

        const companies = await Company.find({}).sort({ createdAt: -1 });
        const branches = await Branch.find({}).sort({ createdAt: -1 });
        const employees = await Employee.find({}).sort({ createdBy: -1 });
        const plans = await Plan.find({}).sort({ createdAt: -1 });
        const roles = await Role.find({}).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: {
                companies,
                branches,
                employees,
                plans,
                roles
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false
        });
    }
}

exports.getCompanyData = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Company id is required",
            });
        }

        const branches = await Branch.find({
            companyId: id,
        }).sort({ createdAt: -1 });

        const branchesWithPlans = await Promise.all(
            branches.map(async (branch) => {
                const realation = await BranchPlanRelation.findOne({
                    branch_id: branch._id,
                    status: 'active'
                }).populate({
                    path: 'plan_id',
                    populate: {
                        path: 'features.feature_id',
                        model: 'Feature'
                    },
                });

                const role = await Role.findOne({
                    name: 'BRANCH_MANAGER',
                });


                const permissions = await Permission.find({
                    _id: { $in: role.permissions }
                }).select('name');

                const permission_names = permissions.map((permission) => {
                    return permission.name;
                });

                return {
                    ...branch.toObject(),
                    plan: realation,
                    permissions: permission_names
                }
            })
        );

        return res.json({
            success: true,
            data: {
                branches: branchesWithPlans,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getBranchsData = async (req, res) => {
    try {
        const { id: branchId } = req.params;

        const employees = await Employee.find({
            branch_id: branchId,
        }).sort({ createdAt: -1 });

        // Today's start & end
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    branchId: new mongoose.Types.ObjectId(branchId),
                    // branchId: branchId,
                    attendanceDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                },
            },
            {
                $group: {
                    _id: "$status",
                    total: { $sum: 1 },
                },
            },
        ]);

        const stats = {
            todayPresent: 0,
            todayAbsent: 0,
            todayOnLeave: 0,
        };

        attendanceStats.forEach((item) => {
            if (item._id === "present") stats.todayPresent = item.total;
            if (item._id === "absent") stats.todayAbsent = item.total;
            if (item._id === "onLeave") stats.todayOnLeave = item.total;
        });

        return res.status(200).json({
            success: true,
            data: {
                employees,
                ...stats,
                startOfDay,
                endOfDay
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
};

exports.getEmployeeData = async (req, res) => {
    try {
        const { id } = req.params;


        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            employeeId: id,
            status: "present",
            attendanceDate: {
                $gte: start,
                $lte: end,
            },
        });

        const history = await Attendance.find({
            employeeId: id,
        }).sort({createdAt: 1});

        return res.status(200).json({
            success: true,
            data: {
                attendance,
                history,
                today
            },
        })


    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            maessahe: 'Server Error'
        });
    }
}