
const Feature = require("../../models/Feature");
const Plan = require("../../models/Plan");

exports.getFeatures = async(req, res)=>{
    const features = await Feature.find()
        .sort({ createdAt: -1 });
    
    return res.json({
        success: true,
        data: features
    });
}

exports.createFeature = async(req,res)=>{

    const {
        name,
        slug,
        description,
        monthlyPrice,
        type,
        value,
        yearlyPrice
    } = req.body;

    const exists =
    await Feature.findOne({
        slug
    });

    if(exists){

        return res.status(400)
        .json({
            success:false,
            message:
            "Feature already exists"
        });
    }

    const feature =
    await Feature.create({

        name,
        slug,
        description,
        type,
        value : type == "module" ? true : value,
        monthlyPrice,
        yearlyPrice
    });

    return res.status(201)
    .json({
        success:true,
        data:feature
    });
};

exports.updateFeature = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      name,
      slug,
      description,
      monthlyPrice,
      yearlyPrice,
      type,
      value,
      status
    } = req.body;

    const feature = await Feature.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found"
      });
    }

    // Check duplicate slug
    const slugExists = await Feature.findOne({
      slug,
      _id: { $ne: id }
    });

    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "Feature slug already exists"
      });
    }

    feature.name = name;
    feature.slug = slug;
    feature.description = description;
    feature.type = type;
    feature.value = type == "module" ? true : value,
    feature.monthlyPrice = monthlyPrice;
    feature.yearlyPrice = yearlyPrice;
    feature.status = status;

    await feature.save();

    return res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: feature
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



exports.deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const feature = await Feature.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    const plans = await Plan.find({
      features: id,
    }).populate("features");

    // Remove feature from all plans
    await Plan.updateMany(
      { features: id },
      {
        $pull: {
          features: id,
        },
      }
    );

    // Delete feature
    await Feature.findByIdAndDelete(id);

  

    for (const plan of plans) {
      plan.features = plan.features.filter(
        (f) => f._id.toString() !== id
      );

      plan.monthlyPrice = plan.features.reduce(
        (sum, f) => sum + (f.monthlyPrice || 0),
        0
      );

      plan.yearlyPrice = plan.features.reduce(
        (sum, f) => sum + (f.yearlyPrice || 0),
        0
      );

      await plan.save();
    }

    return res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};