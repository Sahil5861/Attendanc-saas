const Plan = require("../../models/Plan");
const Feature = require("../../models/Feature");
const { createRazorpayPlans } = require("../../services/razorpay.service");

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

const getPlanPrices = (features = []) => {

    const monthlyPrice = features.reduce((total, feature) => {
        return total + Number(feature.price || 0);
    }, 0);

    return {
        monthlyPrice,
        quarterlyPrice: monthlyPrice * 3,
        halfYearlyPrice: monthlyPrice * 6,
        yearlyPrice: monthlyPrice * 12
    };
};

exports.createPlan = async (req, res) => {

    try {

        const {
            name,
            description,
            features,
            isCustom,
            status,
            company_id,
            branch_id
        } = req.body;

        const formattedFeature = features.map((feature) => ({
            feature_id: feature.feature_id,
            type: feature.type,
            limit: feature.limit || "",
            price: Number(feature.price || 0)
        }));

        const prices = getPlanPrices(formattedFeature);

        

        const plan = await Plan.create({

            name,
            description,

            features: formattedFeature,

            isCustom,

            company_id,

            branch_id,

            status,

            monthlyPrice: prices.monthlyPrice,

            quarterlyPrice: prices.quarterlyPrice,

            halfYearlyPrice: prices.halfYearlyPrice,

            yearlyPrice: prices.yearlyPrice,

            isCreated: false

        });

        // Create Razorpay Plans
        const razorpayPlans = await createRazorpayPlans({
            name,
            prices
        });

                // Check if all Razorpay plans are created successfully
        if (
            razorpayPlans &&
            razorpayPlans.monthly &&
            razorpayPlans.quarterly &&
            razorpayPlans.halfYearly &&
            razorpayPlans.yearly
        ) {
            plan.razorpayPlans = razorpayPlans;
            plan.isCreated = true;

            await plan.save();
        }

        return res.status(201).json({
            success: true,
            data: plan
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
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