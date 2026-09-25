const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        leaveType: {
            type: String,
            enum: ["Casual", "Sick"],
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        totalDays: {
            type: Number,
            required: true,
            min: 1
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },

        managerComment: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const LeaveRequest = mongoose.model(
    "LeaveRequest",
    leaveRequestSchema
);

module.exports = LeaveRequest;