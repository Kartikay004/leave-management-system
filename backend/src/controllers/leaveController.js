const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const { calculateWorkingDays } = require("../utils/dateUtils");

// ==================== APPLY LEAVE (Employee) ====================
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // 1. Validate inputs
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "All fields (leaveType, startDate, endDate, reason) are required."
            });
        }

        if (!["Casual", "Sick"].includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type. Must be 'Casual' or 'Sick'."
            });
        }

        if (!reason.trim()) {
            return res.status(400).json({
                message: "Reason cannot be empty."
            });
        }

        // 2. Date calculation & Weekend handling
        let dateInfo;
        try {
            dateInfo = calculateWorkingDays(startDate, endDate);
        } catch (err) {
            return res.status(400).json({
                message: err.message
            });
        }

        const { workingDays, weekendDays, calendarDays, startDateNormalized, endDateNormalized } = dateInfo;

        // Edge Case: Leave date range spanning weekend entirely with 0 working days
        if (workingDays === 0) {
            return res.status(400).json({
                message: `The selected date range (${calendarDays} total days) falls entirely on weekends (${weekendDays} weekend days). No working leave days requested.`
            });
        }

        // 3. Edge Case: Check for Overlapping Leave Requests (Pending or Approved)
        const overlappingLeave = await LeaveRequest.findOne({
            employee: req.user._id,
            status: { $in: ["Pending", "Approved"] },
            startDate: { $lte: endDateNormalized },
            endDate: { $gte: startDateNormalized }
        });

        if (overlappingLeave) {
            const formatOverlappingStart = new Date(overlappingLeave.startDate).toISOString().split('T')[0];
            const formatOverlappingEnd = new Date(overlappingLeave.endDate).toISOString().split('T')[0];

            return res.status(400).json({
                message: `Overlapping leave request detected! You already have a ${overlappingLeave.status.toLowerCase()} leave request from ${formatOverlappingStart} to ${formatOverlappingEnd}.`
            });
        }

        // 4. Edge Case: Check Insufficient Leave Balance
        const user = await User.findById(req.user._id);
        const typeKey = leaveType.toLowerCase(); // 'casual' or 'sick'
        const currentBalance = user.leaveBalance ? user.leaveBalance[typeKey] : 0;

        if (workingDays > currentBalance) {
            return res.status(400).json({
                message: `Insufficient ${leaveType} leave balance. Requested: ${workingDays} working day(s), Available: ${currentBalance} day(s).`
            });
        }

        // 5. Create Leave Request
        const newLeave = await LeaveRequest.create({
            employee: req.user._id,
            leaveType,
            startDate: startDateNormalized,
            endDate: endDateNormalized,
            totalDays: workingDays,
            reason: reason.trim(),
            status: "Pending"
        });

        return res.status(201).json({
            message: `Leave request submitted successfully. (${workingDays} working days calculated; ${weekendDays} weekend days excluded)`,
            leave: newLeave,
            details: {
                calendarDays,
                workingDays,
                weekendDaysExcluded: weekendDays
            }
        });

    } catch (error) {
        console.error("Apply leave error:", error);
        return res.status(500).json({
            message: "Server error while processing leave request."
        });
    }
};

// ==================== GET MY LEAVES (Employee) ====================
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ employee: req.user._id })
            .sort({ createdAt: -1 });

        const user = await User.findById(req.user._id).select("leaveBalance");

        return res.status(200).json({
            count: leaves.length,
            leaveBalance: user ? user.leaveBalance : { casual: 0, sick: 0 },
            leaves
        });
    } catch (error) {
        console.error("Get my leaves error:", error);
        return res.status(500).json({
            message: "Server error while fetching your leaves."
        });
    }
};

// ==================== GET PENDING LEAVES (Manager) ====================
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ status: "Pending" })
            .populate("employee", "name email leaveBalance")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: leaves.length,
            leaves
        });

    } catch (error) {
        console.error("Get pending leaves error:", error);
        return res.status(500).json({
            message: "Server error while fetching pending leaves."
        });
    }
};

// ==================== GET ALL LEAVES (Manager) ====================
const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            filter.status = status;
        }

        const leaves = await LeaveRequest.find(filter)
            .populate("employee", "name email leaveBalance")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: leaves.length,
            leaves
        });
    } catch (error) {
        console.error("Get all leaves error:", error);
        return res.status(500).json({
            message: "Server error while fetching all leaves."
        });
    }
};

// ==================== UPDATE LEAVE STATUS (Manager) ====================
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerComment } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'Approved' or 'Rejected'."
            });
        }

        const leave = await LeaveRequest.findById(id);

        if (!leave) {
            return res.status(404).json({
                message: "Leave request not found."
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                message: `This leave request has already been ${leave.status.toLowerCase()}.`
            });
        }

        const employee = await User.findById(leave.employee);

        if (!employee) {
            return res.status(404).json({
                message: "Associated employee not found."
            });
        }

        // If approving, deduct balance and check sufficiency
        if (status === "Approved") {
            const typeKey = leave.leaveType.toLowerCase();
            const currentBalance = employee.leaveBalance ? employee.leaveBalance[typeKey] : 0;

            if (currentBalance < leave.totalDays) {
                return res.status(400).json({
                    message: `Cannot approve request: Employee ${employee.name} has insufficient ${leave.leaveType} leave balance. Available: ${currentBalance}, Required: ${leave.totalDays}.`
                });
            }

            // Deduct balance
            employee.leaveBalance[typeKey] -= leave.totalDays;
            await employee.save();
        }

        leave.status = status;
        if (managerComment !== undefined) {
            leave.managerComment = managerComment.trim();
        }
        await leave.save();

        return res.status(200).json({
            message: `Leave request ${status.toLowerCase()} successfully.`,
            leave,
            employeeBalance: employee.leaveBalance
        });

    } catch (error) {
        console.error("Update leave status error:", error);
        return res.status(500).json({
            message: "Server error while updating leave status."
        });
    }
};

// ==================== GET EMPLOYEES LIST (Manager) ====================
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" })
            .select("name email leaveBalance createdAt")
            .sort({ name: 1 });

        return res.status(200).json({
            count: employees.length,
            employees
        });
    } catch (error) {
        console.error("Get employees error:", error);
        return res.status(500).json({
            message: "Server error while fetching employee directory."
        });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getEmployees
};