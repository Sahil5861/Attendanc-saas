const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Branch = require("../../models/Branch");
const Company = require("../../models/Company");
const Role = require("../../models/Role");
const Plan = require("../../models/Plan");
const BranchPlanRelation = require("../../models/BranchPlanRelation");
const Designation = require("../../models/Designation");
const Department = require("../../models/Department");

const masters = require("../../constants/masters");
const Team = require("../../models/Team");
 




exports.getCompanyBranches = async(req, res)=>{
    try {        

        const branches = await Branch.find({})
        .populate("companyId", "companyName")
        .sort({createdAt: -1});


        const branchesData = branches.map( branch =>({
            ...branch.toObject(),
            companyName : branch.companyId?.companyName || ""
        }));



        return res.status(200).json({
            success:true,
            data:branchesData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }
}

exports.getBranchById = async(req, res) => {
    const {id} = req.params;


    const branch = await Branch.findById(id);

    if (branch) {
        return res.status(200).json({
            success:true,
            data:branch
        });
    }
    else{
        return res.status(400).json({
            success:false,
            message: 'Branch Not found'
        });
    }

}

exports.createCompanyBranches = async(req, res)=>{
    try {

        const {            
            branchOwnerName,
            branchName,
            location,
            city, state,
            mobileNumber,
            email,
            password,
            status, company_id
        } = req.body;
        const user_exist = await User.findOne({email})

        if (
            !branchOwnerName ||
            !branchName ||
            !email ||
            !mobileNumber || 
            !company_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Required Feilds are missing !"
            });
        }

        // console.log(user_exist);

        if (user_exist) {
            return res.status(400).json({
                success: false,
                message: "User already exist with this email",
            });
        }

        const branch_exist = await Branch.findOne({
            branchName, 
            company_id
        });

        if (branch_exist) {
            return res.status(400).json({
                success: false,
                message: "Branch Already exist for this company",
            });
        }


        const branch = await Branch.create({
            companyId: company_id,
            branchName,
            branchOwnerName,
            location,
            city,
            state,
            mobileNumber,
            email,
            status,
        });

        const branchRole =await Role.findOne({name: "BRANCH_MANAGER"});

        const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );

        if (branch) {


            await Designation.insertMany(
                masters.designations.map((item)=>({
                    ...item, branchId: branch._id, status: true                    
                }))
            )



            const user = await User.create({
                branchId: branch._id,
                email,
                name: branchOwnerName,
                phone: mobileNumber,
                realPassword: password,
                password: hashedPassword,
                role: "BRANCH_MANAGER",
                roleId:branchRole._id,
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


exports.updateCompanyBranches = async(req, res)=>{

    try {
        const {id}  = req.params;
        const {
            branchOwnerName, branchName, location, city, state, mobileNumber, email, password, status, company_id
        } = req.body;

        if (
            !branchOwnerName || !branchName || !mobileNumber || !company_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Required Feilds are missing !"
            });
        }

       const branch = await Branch.findByIdAndUpdate(
        id, 
        {
            companyId: company_id, 
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
            new : true,
            runValidators: true,
        }
       );


       console.log('Branch : ', branch);
       

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


exports.deleteCompanyBranches = async (req, res)=>{
    try {
        const {id} = req.params;

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


// plans

exports.getPlans = async(req,res)=>{


    const branchId = req.get('X-Branch-Id');

    const customPlans = await Plan.find({
        isCustom: true,
        branch_id: branchId
    });

    const includeCustom = customPlans.length > 0 ? true : false;

    let filter = {};

    if(!includeCustom) {
        filter = {
            isCustom:  false,
        }
    }
    const plans =
    await Plan.find(filter)
    .populate(
        "features.feature_id",
        "name monthlyPrice yearlyPrice"
    )

    .sort({
        createdAt:-1
    });

    return res.json({
        success:true,
        data:plans
    });
};


// GET /branches/:branchId/active-plan
exports.getBranchActivePlan = async (req, res) => {
  try {
    const { id } = req.params;


    console.log('req :', req);
    
 
    const relation = await BranchPlanRelation.findOne({
      branch_id: id,
      status: "active",
    }).lean();
 
    return res.status(200).json({ status: true, data: relation || null });
  } catch (err) {

    console.error(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.assignPlanToBranch = async (req, res) => {
  try {
    const { branch_id, plan_id, billingCycle } = req.body;
 
    if (!branch_id || !plan_id) {
      return res.status(400).json({ status: false, message: "branch_id and plan_id are required" });
    }
 
    // 1. Expire existing active plan(s) for this branch
    await BranchPlanRelation.updateMany(
      { branch_id, status: "active" },
      { $set: { status: "expired" } }
    );
 
    // 2. Create new active relation
    const newRelation = await BranchPlanRelation.create({
      branch_id,
      plan_id,
      billingCycle,
      status: "active",
    });
 
    return res.status(200).json({
      status: true,
      message: "Plan assigned successfully",
      data: newRelation,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// designations

exports.getDesignations = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');
    
        const designations = await Designation.find({branchId: branchId}).sort({createdAt: -1});

        if(designations){
            return res.status(200).json({
                success: true,
                data:designations,
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: 'Designatins not found'
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.createDesignations = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');

        const {title, slug, status} = req.body;

        const designation = await Designation.create({
            title, slug, status, branchId
        });

        if (designation) {
            return res.status(200).json({
                success: true, 
                message: 'Designation added succcessfully !'
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.updateDesignations = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');

        const {id} = req.params;
        const {title, slug, status} = req.body;

        const designation = await Designation.findByIdAndUpdate(
            id, 
            {
                title, 
                slug, 
                branchId,
                status
            },
        );

        if (designation) {
            return res.status(200).json({
                success: true, 
                message: 'Designation updated succcessfully !'
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.deleteDesignations = async(req, res)=>{
    try {
        const {id} = req.params;

        const designation = await Designation.findById(id);
        if(designation){
            await Designation.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: 'Designation Deleted successfully !'
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
}


// departments

exports.getDepartments = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');
    
        const designations = await Department.find({branchId: branchId}).sort({createdAt: -1});

        if(designations){
            return res.status(200).json({
                success: true,
                data:designations,
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: 'Designatins not found'
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.createDepartments = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');

        const {title, slug, status} = req.body;

        const designation = await Department.create({
            title, slug, status, branchId
        });

        if (designation) {
            return res.status(200).json({
                success: true, 
                message: 'Department added succcessfully !'
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.updateDepartments = async(req, res) =>{
    
    try {
        const branchId = req.get('X-Branch-Id');

        const {id} = req.params;
        const {title, slug, status} = req.body;

        const designation = await Department.findByIdAndUpdate(
            id, 
            {
                title, 
                slug, 
                branchId,
                status
            },
        );

        if (designation) {
            return res.status(200).json({
                success: true, 
                message: 'Department updated succcessfully !'
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
        })
    }
}

exports.deleteDepartments = async(req, res)=>{
    try {
        const {id} = req.params;

        const designation = await Department.findById(id);
        if(designation){
            await Department.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: 'Department Deleted successfully !'
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
}


// teams


exports.getTeams = async(req, res) => {
    try{
        const branchId = req.get('X-Branch-Id');

        const teams = await Team.find({
            branchId: branchId
        });

        if(teams){
            return res.status(200).json({
                success: true, data: teams
            })
        }
        else{
            return res.status(400).json({
                success: false, message: 'No Teams Found'
            });
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false, message: 'Server error'
        })
    }
}

exports.createTeams = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, status, employeeIds, teamLead } = req.body;
        const branchId = req.get('X-Branch-Id');


        console.log('req body : ', req.body);

        if (!branchId) {
            return res.status(400).json({
                success: false, message: 'Branch ID is required'
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false, message: 'Title is required'
            });
        }

        const branch = await Branch.findById(branchId);

        if (!branch) {
            return res.status(404).json({
                success: false, message: 'Branch not found'
            });
        }

        const company = await Company.findOne({ _id: branch.companyId });

        if (!company) {
            return res.status(404).json({
                success: false, message: 'Company not found'
            });
        }

        const companyId = company._id;

        // Duplicate title check — applies for both create AND edit
        const duplicateQuery = {
            title,
            branchId,
        };

        if (id) {
            duplicateQuery._id = { $ne: id };
        }

        const exist = await Team.findOne(duplicateQuery);

        if (exist) {
            return res.status(400).json({
                success: false, message: 'Team with this name already exists !'
            });
        }

        const data = {
            branchId,
            companyId,
            title,
            status,
            slug,
            teamLead,
            employeeIds,
        };

        const team = id
            ? await Team.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            : await Team.create(data);

        if (!team) {
            return res.status(404).json({
                success: false, message: 'Team not found'
            });
        }

        const message = id ? 'Team updated successfully !' : 'Team created successfully !';

        return res.status(200).json({
            success: true, message, data: team
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, message: 'Server Error',
        });
    }
};


exports.deleteTeams = async(req, res) => {
    try {
        const {id} = req.params;
        const team = await Team.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,  message: 'Team Deleted Successfully !' 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error,
        })
    }
}