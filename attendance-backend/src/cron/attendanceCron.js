const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const BranchSettings = require("../models/BranchSettings");


cron.schedule(
    "60 * * *", // Every day at 6 PM
    async () => {
        console.log("Running Auto Absent Cron");

        try {

            const branches = await BranchSettings.find({});

            const today = new Date();

            const day = today.getDay();

            // 0 = Sunday
            // 6 = Saturday
            if (day === 0 || day === 6) {
                console.log("Holiday. Cron skipped.");
                return;
            }

            const currentTime =
                today.getHours().toString().padStart(2, "0") +
                ":" +
                today.getMinutes().toString().padStart(2, "0");

            const start = new Date(today);
            start.setHours(0, 0, 0, 0);

            const end = new Date(today);
            end.setHours(23, 59, 59, 999);

            for (const branch of branches) {

                // agar endTime ke according chalana hai
                // if (currentTime < branch.endTime) continue;

                const employees = await Employee.find({
                    status: true,
                    branch_id: branch.branchId
                });

                for (const employee of employees) {

                    const attendance = await Attendance.findOne({
                        employeeId: employee._id,
                        attendanceDate: {
                            $gte: start,
                            $lte: end
                        }
                    });

                    if (!attendance) {

                        await Attendance.create({
                            employeeId: employee._id,
                            branchId: branch.branchId,
                            attendanceDate: start,
                            status: "absent",
                            remarks: "Automatically marked absent"
                        });

                    }

                }

            }

            console.log("Auto absent completed.");
        } catch (err) {
            console.error(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);