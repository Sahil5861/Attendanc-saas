const Leave = require('../../models/Leave');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Attendance = require('../../models/Attendance');

const { createNotification } = require("../../services/notification.service");
const BranchSettings = require('../../models/BranchSettings');
const Branch = require('../../models/Branch');


exports.getLeavesForBranches = async (req, res) => {
    try {
        const branchId = req.get('X-Branch-Id');

        const employeeIds = await Employee.find({
            branch_id: branchId,
        }).distinct("_id");


        const leaves = await Leave.find({
            employeeId: { $in: employeeIds },
            status: "PENDING",
        })
            .populate('employeeId')
            .sort({ createdAt: -1 });


        if (leaves) {
            return res.status(200).json({
                success: true, data: leaves
            });
        }
        else {
            return res.status(400).json({
                success: false, message: 'Leaves not found',
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getLeave = async (req, res) => {
    try {

        const { id } = req.params;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }


        const branchId = employee.branch_id;

        const branchSetting = await BranchSettings.findOne({
            branchId: branchId
        });

        if (!branchSetting) {
            return res.status(404).json({
                success: false,
                message: "Branch settings not found",
            });
        }


        const leaves = await Leave.find({
            employeeId: id
        }).sort({ createdAt: -1 });

        // Current Month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Approved leaves of current month
        const approvedLeaves = await Leave.find({
            employeeId: id,
            status: "APPROVED",
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });

        const used = {
            sick: 0,
            casual: 0,
            paid: 0,
        };

        approvedLeaves.forEach((leave) => {
            switch (leave.type) {
                case "SICK":
                    used.sick++;
                    break;

                case "CASUAL":
                    used.casual++;
                    break;

                case "PAID":
                    used.paid++;
                    break;
            }
        });


        const summary = {
            sick: {
                total: branchSetting.sickLeave || 0,
                used: used.sick,
                remaining: Math.max(
                    0,
                    (branchSetting.sickLeave || 0) - used.sick
                ),
            },

            casual: {
                total: branchSetting.casualLeave || 0,
                used: used.casual,
                remaining: Math.max(
                    0,
                    (branchSetting.casualLeave || 0) - used.casual
                ),
            },

            paid: {
                total: branchSetting.paidLeave || 0,
                used: used.paid,
                remaining: Math.max(
                    0,
                    (branchSetting.paidLeave || 0) - used.paid
                ),
            },
        };

        if (leaves) {
            return res.status(200).json({
                success: true, data: leaves, leaveSummary: summary,
            });
        }
        else {
            return res.status(400).json({
                success: false, message: 'Leaves not found',
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false, message: error.message
        });
    }
}

exports.createLeave = async (req, res) => {
    try {
        console.log('req : ', req.body);

        const { reason, daysType, type, fromDate, toDate, date, status, employeeId } = req.body;

        if (!employeeId) {
            return res.status(200).json({
                success: false, message: 'Employee id is required'
            });
        }

        const data = { reason, daysType, type, fromDate, toDate, date, status, employeeId }

        const leave = await Leave.create(data);

        if (leave) {

            const employee = await Employee.findById(employeeId);

            const employee_user = await User.findOne({
                employeeId: employeeId
            });


            const leave_type = type;


            await createNotification({
                companyId: employee.company_id,
                branchId: employee.branch_id,

                senderId: employee._id,
                senderType: "Employee",

                receiverId: employee.branch_id, // ya company admin

                receiverType: "User",

                type: "LEAVE_REQUEST",

                title: "New Leave Request",

                message: `${employee.firstName} ${employee.lastName} applied for ${leave_type} leave.`,

                referenceId: leave._id,

                referenceModel: "Leave",

                actionUrl: "/branch/leaves",
            });


            return res.status(200).json({
                success: true,
                message: 'Leave created successfully !',
                data: leave
            });
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false, message: error.message
        });
    }
}

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (["APPROVED", "REJECTED"].includes(status)) {
            const employee = await Employee.findById(leave.employeeId);

            if (employee) {
                const isApproved = status === "APPROVED";


                // crete attendance for Leave

                if (isApproved) {

                    if (leave.daysType === 'single') {

                        const attendanceDate = new Date(leave.date);

                        attendanceDate.setHours(0, 0, 0, 0);

                        const exist = await Attendance.findOne({
                            employeeId: leave.employeeId,
                            attendanceDate
                        });

                        if (!exist) {
                            const data = {
                                employeeId: leave.employeeId,
                                branchId: employee.branch_id,
                                attendanceDate,
                                status: 'onLeave',
                                remarks: 'On Leave',
                                workingHours: 0
                            };

                            await Attendance.create(data);
                        }
                    }
                    else if (leave.daysType === 'multiple') {
                        const startDate = new Date(leave.fromDate);
                        const endDate = new Date(leave.toDate);

                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);


                        for (
                            let current = new Date(startDate);
                            current <= endDate;
                            current.setDate(current.getDate() + 1)
                        ) {

                            const attendanceDate = new Date(current);

                            const exists = await Attendance.findOne({
                                employeeId: leave.employeeId,
                                attendanceDate
                            });

                            if (!exists) {
                                await Attendance.create({
                                    employeeId: leave.employeeId,
                                    branchId: employee.branch_id,
                                    attendanceDate,
                                    status: "onLeave",
                                    remarks: "On Leave",
                                    workingHours: 0
                                });
                            }
                        }
                    }
                }
               
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully !',
            data: updatedLeave,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findByIdAndDelete(id);

        if (leave) {
            return res.status(200).json({
                success: true, message: 'Deleted successfully !'
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false
        })
    }
}
