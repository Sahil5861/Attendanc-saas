const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Permission = require("../../models/Permission");
const Branch = require("../../models/Branch");
const BranchPlanRelation = require('../../models/BranchPlanRelation')
const Company = require("../../models/Company");
const Feature = require("../../models/Feature");

const Designation = require("../../models/Designation");
const masters = require("../../constants/masters")


const Role = require("../../models/Role");
const State = require("../../models/State");
const City = require("../../models/City");


exports.getCompanies = async (req, res) => {

    try {

        const companies =
            await Company.find()
                .populate(
                    "adminUserId",
                    "name email phone"
                )
                .sort({
                    createdAt: -1
                });

        return res.json({
            success: true,
            data: companies
        });

    }
    catch (error) {
        console.log('error : ', error);

        return res.status(500)
            .json({
                success: false
            });
    }
};

exports.getCompany = async (req, res) => {

    try {

        const company =
            await Company.findById(
                req.params.id
            )
                .populate(
                    "adminUserId",
                    "name email phone"
                );

        if (!company) {

            return res.status(404)
                .json({
                    success: false,
                    message:
                        "Company not found"
                });
        }

        return res.json({
            success: true,
            data: company
        });

    }
    catch (error) {

        return res.status(500)
            .json({
                success: false
            });
    }
};

exports.createCompany = async (req, res) => {

    try {

        const {
            companyName, companyCode, ownerName, email, phone, gstNumber, address, adminName, adminEmail, adminPhone, password, city, state
        } = req.body;

        const companyExists =
            await Company.findOne({
                $or: [
                    {
                        email
                    },
                    {
                        companyCode
                    }
                ]
            });

        if (companyExists) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Company already exists"
                });
        }

        const userExists =
            await User.findOne({
                email: adminEmail
            });

        if (userExists) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Admin email already exists"
                });
        }

        const companyAdminRole =
            await Role.findOne({
                name: "COMPANY_ADMIN"
            });

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            phone: adminPhone,
            password: hashedPassword,
            realPassword: password,
            role: 'COMPANY_ADMIN',
            roleId: companyAdminRole._id
        });

        const gst = gstNumber;

        const company = await Company.create({
            companyName,
            companyCode,
            ownerName,
            email,
            phone,
            gst,
            address,
            city, state,
            adminUserId: adminUser._id,
            createdBy: req.user.id
        });

        if (company) {
            adminUser.companyId = company._id;
            await adminUser.save();

            // also create first branh for this company

            const branch = await Branch.create({
                companyId: company._id,
                branchName: companyName,
                branchOwnerName: ownerName,
                location: address,
                mobileNumber: phone,
                city: city,
                state: state,
                email: email,
                status: true,
                createdBy: req.user.id
            });

            await Designation.insertMany(
                masters.designations.map((item) => ({
                    ...item, branchId: branch._id, status: true
                }))
            )


            return res.status(201).json({
                success: true,
                message: "Company created successfully",
                company,
                credentials: {
                    email: adminEmail,
                    password
                }
            });
        }




    }
    catch (error) {

        console.log(error);

        return res.status(500)
            .json({
                success: false,
                message: "Server Error"
            });
    }
};

exports.updateCompany = async (req, res) => {

    try {

        const {
            companyName,
            companyCode,
            ownerName,
            email,
            phone,
            gstNumber,
            address,
            city,
            state,
            adminName,
            adminEmail,
            adminPhone
        } = req.body;

        console.log('req : ', req.body);


        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // Duplicate company email/company code check

        const existingCompany =
            await Company.findOne({
                _id: { $ne: company._id },
                $or: [
                    { email },
                    { companyCode }
                ]
            });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message:
                    "Company email or code already exists"
            });
        }

        // Update Company

        company.companyName = companyName;
        company.companyCode = companyCode;
        company.ownerName = ownerName;
        company.email = email;
        company.phone = phone;
        company.gst = gstNumber;
        company.address = address;
        company.city = city;
        company.state = state;

        await company.save();

        // Update Admin User        

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company
        });

    }
    catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.deleteCompany = async (req, res) => {

    try {

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // delete admin user also

        if (company.adminUserId) {
            await User.findByIdAndDelete(
                company.adminUserId
            );
        }

        await Company.findByIdAndDelete(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.changeStatus = async (req, res) => {

    try {

        const company =
            await Company.findById(
                req.params.id
            );

        company.status =
            !company.status;

        await company.save();

        return res.json({

            success: true,

            status:
                company.status
        });

    }
    catch (error) {

        return res.status(500)
            .json({
                success: false
            });
    }
};

exports.getBranchesByCompany = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Company id is required'
            })
        }


        const branches = await Branch.find({
            companyId: id
        }).sort({
            createdAt: -1
        });

        const allBranches = await Promise.all(
            branches.map(async (branch) => {

                const state = await State.findOne({
                    stateId: Number(branch.state)
                });

                const city = await City.findOne({
                    cityId: Number(branch.city)
                });

                return {
                    ...branch.toObject(),
                    state,
                    city
                };
            })
        );

        


        if (branches.length > 0) {
            return res.status(200).json({
                success: true,
                data: allBranches
            });
        }

        else {
            return res.status(400).json({
                success: false,
                mesage: "Branches not found"
            });
        }
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};



exports.getCompanyBranches = async (req, res) => {
    try {


        const companyId = req.user.companyId;


        const branches = await Branch.find({
            companyId: companyId
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
                const user = await User.findOne({
                    branchId: branch._id
                });



                const role = await Role.findById(
                    user.roleId
                );


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

        return res.status(200).json({
            success: true,
            data: branchesWithPlans
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

exports.getBranchById = async (req, res) => {
    const { id } = req.params;


    const branch = await Branch.findById(id);

    if (branch) {
        return res.status(200).json({
            success: true,
            data: branch
        });
    }
    else {
        return res.status(400).json({
            success: false,
            message: 'Branch Not found'
        });
    }

}


exports.createCompanyBranches = async (req, res) => {
    // console.log('req : ', req);


    try {

        const {
            branchOwnerName,
            branchName,
            location,
            city, state,
            mobileNumber,
            email,
            password,
            status, companyId
        } = req.body;
        const user_exist = await User.findOne({ email })


        if (
            !branchOwnerName ||
            !branchName ||
            !email ||
            !mobileNumber ||
            !companyId
        ) {
            return res.status(400).json({
                success: false,
                message: "Required Feilds are missing !"
            });
        }


        if (user_exist) {
            return res.status(400).json({
                success: false,
                message: "User already exist with this email",
            });
        }

        const branch_exist = await Branch.findOne({
            branchName,
            companyId
        });

        if (branch_exist) {
            return res.status(400).json({
                success: false,
                message: "Branch Already exist for this company",
            });
        }


        const branch = await Branch.create({
            companyId,
            branchName,
            branchOwnerName,
            location,
            city,
            state,
            mobileNumber,
            email,
            status,
        });

        const branchRole = await Role.findOne({
            name: "BRANCH_MANAGER"
        });

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        if (branch) {

            await Designation.insertMany(
                masters.designations.map((item) => ({
                    ...item, branchId: branch._id, status: true
                }))
            )

            const user = await User.create({
                branchId: branch._id,
                email,
                name: branchOwnerName,
                phone: mobileNumber,
                password: hashedPassword,
                realPassword: password,
                role: "BRANCH_MANAGER",
                roleId: branchRole._id,
            });


            return res.status(200).json({
                success: true,
                message: "Branch Created successfully !",
            });
        }



    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }




}


exports.updateCompanyBranches = async (req, res) => {

    try {
        const { id } = req.params;
        const {
            branchOwnerName, branchName, location, city, state, mobileNumber, email, password, status, companyId
        } = req.body;

        if (
            !branchOwnerName || !branchName || !mobileNumber || !companyId
        ) {
            return res.status(400).json({
                success: false,
                message: "Required Feilds are missing !"
            });
        }

        const branch = await Branch.findByIdAndUpdate(
            id,
            {
                companyId,
                branchName,
                branchOwnerName,
                location,
                city,
                state,
                mobileNumber,
                email,
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );


        if (branch) {
            return res.status(200).json({
                success: true,
                message: "Branch Updated successfully !",
            });
        };

        return res.status(400).json({
            success: false,
            message: "Branch Not found",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
}


exports.deleteCompanyBranches = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await Branch.findByIdAndDelete(
            id
        );

        if (branch) {
            return res.status(200).json({
                success: true,
                message: "Branch Deleted Successfully"
            });
        }
        return res.state(400).json({
            success: false,
            message: "Branch not found",
        });
    } catch (error) {
        console.error(error)
        return res.status(500).jons({
            success: false,
            message: "Server Error"
        });
    }
}


