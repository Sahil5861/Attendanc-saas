const Company = require("../../models/Company");
const Branch = require("../../models/Branch");
const Holiday = require("../../models/Holiday");
const mongoose = require("mongoose");

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

exports.getHolidays = async(req, res) =>{
    try{
        const companyId = req.user.companyId;

        const holidays = await Holiday.find({
            companyId: companyId
        }).sort({createdAt: -1});


        return res.status(200).json({
            success: true, data: holidays
        });
    }
    catch(error){
        return res.status(500).json({
            success: false, message: console.error(error.message)
        });
    }
}

exports.createHoliday = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            date,
            isPaid,
            isOptional,
            appliesToAllBranches,
            branchIds,
            isRecurring,
            status,
            notes,
        } = req.body;

        const companyId = req.user.companyId;
        const createdBy = req.user._id;

        // Basic validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Holiday title is required",
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Holiday date is required",
            });
        }

        if (
            appliesToAllBranches === false &&
            (!Array.isArray(branchIds) || branchIds.length === 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one branch must be selected when not applying to all branches",
            });
        }

        const slug = generateSlug(title);

        // Prevent duplicate slug within the same company
        const existing = await Holiday.findOne({ companyId, slug });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "A holiday with this title already exists",
            });
        }

        const holiday = await Holiday.create({
            companyId,
            title: title.trim(),
            slug,
            description: description?.trim() || "",
            type: type || "national",
            date,
            isPaid: isPaid ?? true,
            isOptional: isOptional ?? false,
            appliesToAllBranches: appliesToAllBranches ?? true,
            branchIds: appliesToAllBranches ? [] : branchIds,
            isRecurring: isRecurring ?? true,
            status: status || "active",
            createdBy,
            notes: notes?.trim() || "",
        });

        return res.status(201).json({
            success: true,
            message: "Holiday created successfully",
            data: holiday,
        });
    } catch (error) {
        // Handle Mongoose validation errors distinctly
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((e) => e.message)
                    .join(", "),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid holiday id" });
        }

        const holiday = await Holiday.findOne({ _id: id, companyId });
        if (!holiday) {
            return res.status(404).json({ success: false, message: "Holiday not found" });
        }

        const {
            title,
            description,
            type,
            date,
            isPaid,
            isOptional,
            appliesToAllBranches,
            branchIds,
            isRecurring,
            status,
            notes,
        } = req.body;

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ success: false, message: "Holiday title is required" });
        }

        if (
            appliesToAllBranches === false &&
            (!Array.isArray(branchIds) || branchIds.length === 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one branch must be selected when not applying to all branches",
            });
        }

        // Re-slug only if title changed
        if (title !== undefined && title.trim() !== holiday.title) {
            const newSlug = generateSlug(title);
            const existing = await Holiday.findOne({
                companyId,
                slug: newSlug,
                _id: { $ne: id },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "A holiday with this title already exists",
                });
            }
            holiday.slug = newSlug;
            holiday.title = title.trim();
        }

        if (description !== undefined) holiday.description = description.trim();
        if (type !== undefined) holiday.type = type;
        if (date !== undefined) holiday.date = date;
        if (isPaid !== undefined) holiday.isPaid = isPaid;
        if (isOptional !== undefined) holiday.isOptional = isOptional;
        if (appliesToAllBranches !== undefined) holiday.appliesToAllBranches = appliesToAllBranches;
        holiday.branchIds = appliesToAllBranches ? [] : (branchIds ?? holiday.branchIds);
        if (isRecurring !== undefined) holiday.isRecurring = isRecurring;
        if (status !== undefined) holiday.status = status;
        if (notes !== undefined) holiday.notes = notes.trim();

        await holiday.save();

        return res.status(200).json({
            success: true,
            message: "Holiday updated successfully",
            data: holiday,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((e) => e.message).join(", "),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.deleteHoliday = async(req, res) => {
    try{
        const {id} = req.params;


        const holiday = await Holiday.findByIdAndDelete(id);

        return res.status(200).json({
            success: true, message: 'Holiday Deleted successfully !',
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}