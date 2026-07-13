const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const BranchSettings = require("../models/BranchSettings");

cron.schedule(
    "*/15 * * * *", // Every 15 minutes
    // "26 17 * * *", // Every 15 minutes
    async () => {

        console.log("Running Auto Checkout Cron");

        try {

            const branches = await BranchSettings.find({});

            const now = new Date();

            const day = now.getDay();

            if (day === 0 || day === 6) {
                return;
            }

            const currentTime =
                now.getHours().toString().padStart(2, "0") +
                ":" +
                now.getMinutes().toString().padStart(2, "0");

            const todayStart = new Date(now);
            todayStart.setHours(0,0,0,0);

            const todayEnd = new Date(now);
            todayEnd.setHours(23,59,59,999);

            for(const branch of branches){

                if(currentTime < branch.endTime){
                    continue;
                }

                const attendances = await Attendance.find({
                    branchId: branch.branchId,
                    attendanceDate:{
                        $gte: todayStart,
                        $lte: todayEnd
                    },
                    checkin:{$ne:null},
                    checkout:null
                });

                for(const attendance of attendances){

                    const [hour, minute] = branch.endTime.split(":");

                    const checkoutTime = new Date(attendance.attendanceDate);

                    checkoutTime.setHours(
                        Number(hour),
                        Number(minute),
                        0,
                        0
                    );

                    const workingHours =
                        (checkoutTime - attendance.checkin) /
                        (1000 * 60 * 60);

                    attendance.checkout = checkoutTime;
                    attendance.workingHours = Number(
                        workingHours.toFixed(2)
                    );
                    attendance.isAutoCheckout = true;

                    await attendance.save();

                }

            }

            console.log("Auto checkout completed");

        } catch(err){

            console.error(err);

        }

    },
    {
        timezone:"Asia/Kolkata"
    }
);