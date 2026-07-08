const Plan = require("../../models/Plan");

const Feature = require("../../models/Feature");

exports.getPlans = async(req,res)=>{

    const plans =
    await Plan.find()
    .populate(
        "features.feature_id",
        "name monthlyPrice yearlyPrice"
    )

    .sort({
        createdAt:-1
    });

    if(plans){
        return res.json({
            success:true,
            data:plans
        });
    }
};

exports.createPlan = async(req,res)=>{

    try{

        const {
            name,
            description,
            features,
            isCustom,
            status,
            company_id,
            monthlyPrice,
            yearlyPrice,
            branch_id
        } = req.body;

        const formattedFeature = features.map(
            (feature) => ({
                feature_id: feature.feature_id,
                type: feature.type,
                limit: feature.limit || ""
            })
        );
    

        const plan = await Plan.create({

            name,
            description,
            features: formattedFeature,
            isCustom: isCustom,
            company_id: company_id,
            branch_id: branch_id,
            status: status,
            monthlyPrice,
            yearlyPrice
        });

        if(plan){
            return res.status(201)
            .json({
                success:true,
                data:plan
            });
        }
        else{
            return res(400).json({
                success: false,
                message: 'Something went wrong'
            });
        }


    }
    catch(error){

        return res.status(500)
        .json({
            success:false            
        });
    }
};


exports.updatePlan = async(req,res)=>{

    try{

        const { id } = req.params;
        const {            
            name, description, status, isCustom, company_id, branch_id, monthlyPrice, yearlyPrice, features
        } = req.body;

        const formattedFeature = features.map(
            (feature) => ({
                feature_id: feature.feature_id,
                type: feature.type,
                limit: feature.limit || ""
            })
        );

        const plan = await Plan.findByIdAndUpdate(
            id, 
            {
                name,
                description,
                features : formattedFeature,
                isCustom: isCustom,
                status: status,
                company_id: company_id,
                branch_id: branch_id,
                monthlyPrice,
                yearlyPrice,                
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if(!plan){
            return res.status(400).json({
                success: false,
                message: "Plan not found !"
            });
        }

        return res.status(201)
        .json({
            success:true,
            data:plan
        });

    }
    catch(error){

        console.error(error);


        return res.status(500)
        .json({
            success:false            
        });
    }
};

exports.deletePlan = async(req, res) => {
    try {
        const {id} = req.params;


        const plan = await Plan.findByIdAndDelete(id);

        if(plan){
            return res.status(200).json({
                success: true,
                message: 'Plan deleted successfully !',
            })
        }
        else{
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    } catch (error) {
        
    }
}