const Branch = require("../../models/Branch");
const BranchSettings = require("../../models/BranchSettings");

exports.saveBranchSettings = async (req, res) => {
    try {

        const branchId = req.get('X-Branch-Id');


        const {
            branchName,
            email,
            phone,
            address,
            city,
            state,
            country,
            latitude,
            longitude,
            postalCode,
            timezone,
            currency,
            dateFormat,
            timeFormat,
            startTime,
            endTime,
            recess,
            recessEnd,
            sickLeave,
            casualLeave,
            paidLeave,
            carryForward,
            maxCarryForward,

            logo,
        } = req.body;

        const companyId = req.user.company_id;

        const branch = await Branch.findOne({
            _id: branchId
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
            });
        }

        const settings = await BranchSettings.findOneAndUpdate(
            {
                branchId,
            },
            {
                companyId,
                branchId,

                branchName,
                email,
                phone,
                address,
                city,
                state,
                country,
                latitude,
                longitude,
                postalCode,
                timezone,
                currency,
                dateFormat,
                timeFormat,
                logo,
                startTime,
                endTime,
                recess,
                recessEnd,
                sickLeave,
                casualLeave,
                paidLeave,
                carryForward,
                maxCarryForward,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Branch settings saved successfully.",
            data: settings,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


exports.getBranchSettings = async (req, res) => {
    try {

        // const { branchId } = req.params;

        const branchId = req.get('X-Branch-Id');

        const companyId = req.user.company_id;

        const settings = await BranchSettings.findOne({
            branchId,
            companyId,
        });

        if (settings) {

            return res.status(200).json({
                success: true,
                data: settings,
            });
        }
        else {
            const branch = await Branch.findById(branchId);

            const my_data = {
                branchName: branch.branchName,
                email: branch.email,
                phone: branch.mobileNumber,
                address: branch.location,
                city: branch.city,
                state: branch.state,
                country: "India",
                postalCode: null,
                timezone: "Asia/Kolkata",
                currency: "INR",
                dateFormat: "DD/MM/YYYY",
                timeFormat: "12",
                logo: "",
                startTime: "",
                endTime: "",
                recess: "",
                latitude: null,
                longitude: null,
            }

            return res.status(200).json({
                success: true, data: my_data
            })
        }


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};