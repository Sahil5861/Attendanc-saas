const Leave = require('../../models/Leave');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const Employee = require('../../models/Employee')

const { createNotification } = require("../../services/notification.service");


exports.getLeavesForBranches = async(req, res)=>{
    try{
        const branchId = req.get('X-Branch-Id');

        const employeeIds = await Employee.find({
            branch_id: branchId,
        }).distinct("_id");
        

        const leaves = await Leave.find({
            employeeId: { $in: employeeIds },
            status: "pending",
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
    catch(error){
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

        const leaves = await Leave.find({
            employeeId: id
        }).sort({ createdAt: -1 });

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

    } catch (error) {
        console.error(error)
        return res.status(500).json(200);
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
                success: true, message: 'Leave created successfully !', data: leave
            });
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json(200);
    }
}

exports.updateLeaveStatus = async(req, res) => {
    try {
        const {id, status} = req.params;

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

        if (["approved", "rejected"].includes(status)) {
            const employee = await Employee.findById(leave.employeeId);

            if (employee) {
                const isApproved = status === "approved";

                await createNotification({
                    companyId: employee.company_id,
                    branchId: employee.branch_id,

                    senderId: req.user?.id,
                    senderType: "User",

                    receiverId: employee._id,
                    receiverType: "Employee",

                    type: isApproved ? "LEAVE_APPROVED" : "LEAVE_REJECTED",

                    title: isApproved ? "Leave Approved" : "Leave Rejected",

                    message: `Your ${leave.type} leave request has been ${isApproved ? "approved" : "rejected"}.`,

                    referenceId: leave._id,
                    referenceModel: "Leave",

                    actionUrl: "/employee/leaves",
                });
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
            message: "Failed to update leave status",
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
