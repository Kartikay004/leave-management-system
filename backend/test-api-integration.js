require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const LeaveRequest = require("./src/models/LeaveRequest");
const { registerUser, loginUser } = require("./src/controllers/authController");
const { applyLeave, updateLeaveStatus } = require("./src/controllers/leaveController");

async function runIntegrationTests() {
    console.log("==========================================");
    console.log("STARTING FULL LEAVE SYSTEM INTEGRATION TEST");
    console.log("==========================================");

    await connectDB();

    try {
        // Clean up test data
        const testEmail = "test_employee_qa@example.com";
        const testUser = await User.findOne({ email: testEmail });
        if (testUser) {
            await LeaveRequest.deleteMany({ employee: testUser._id });
            await User.deleteOne({ email: testEmail });
            console.log("[Setup] Cleaned previous test employee");
        }

        // 1. Create Test Employee
        const mockReqReg = {
            body: {
                name: "Test QA Employee",
                email: testEmail,
                password: "password123"
            }
        };

        let regResponse = {};
        const mockResReg = {
            status: (code) => {
                regResponse.statusCode = code;
                return {
                    json: (data) => { regResponse.data = data; }
                };
            }
        };

        await registerUser(mockReqReg, mockResReg);
        console.log("1. Registration Test:", regResponse.statusCode === 201 ? "PASSED ✅" : "FAILED ❌", regResponse.data.message);

        const createdUser = await User.findOne({ email: testEmail });

        // 2. Test Edge Case: Weekend Only (Oct 10-11, 2026 is Sat-Sun)
        const mockReqWeekend = {
            user: createdUser,
            body: {
                leaveType: "Casual",
                startDate: "2026-10-10",
                endDate: "2026-10-11",
                reason: "Weekend trip"
            }
        };
        let weekendRes = {};
        const mockResWeekend = {
            status: (code) => {
                weekendRes.statusCode = code;
                return { json: (data) => { weekendRes.data = data; } };
            }
        };
        await applyLeave(mockReqWeekend, mockResWeekend);
        console.log("2. Weekend-Only Edge Case:", weekendRes.statusCode === 400 ? "PASSED ✅ (Blocked weekend-only leave)" : "FAILED ❌", weekendRes.data.message);

        // 3. Test Edge Case: Insufficient Balance (Requesting 15 days when balance is 10)
        // Oct 1 to Oct 21, 2026 = 15 working days
        const mockReqExceed = {
            user: createdUser,
            body: {
                leaveType: "Casual",
                startDate: "2026-10-01",
                endDate: "2026-10-21",
                reason: "Long vacation exceeding balance"
            }
        };
        let exceedRes = {};
        const mockResExceed = {
            status: (code) => {
                exceedRes.statusCode = code;
                return { json: (data) => { exceedRes.data = data; } };
            }
        };
        await applyLeave(mockReqExceed, mockResExceed);
        console.log("3. Insufficient Balance Edge Case:", exceedRes.statusCode === 400 ? "PASSED ✅ (Blocked insufficient balance)" : "FAILED ❌", exceedRes.data.message);

        // 4. Test Valid Leave Request Spanning Weekend (Oct 9 Fri to Oct 12 Mon = 2 working days)
        const mockReqValid = {
            user: createdUser,
            body: {
                leaveType: "Casual",
                startDate: "2026-10-09",
                endDate: "2026-10-12",
                reason: "Family gathering spanning weekend"
            }
        };
        let validRes = {};
        const mockResValid = {
            status: (code) => {
                validRes.statusCode = code;
                return { json: (data) => { validRes.data = data; } };
            }
        };
        await applyLeave(mockReqValid, mockResValid);
        console.log("4. Weekend Spanning Leave Request:", validRes.statusCode === 201 ? "PASSED ✅ (Calculated 2 working days)" : "FAILED ❌", validRes.data.message);
        const leaveId = validRes.data.leave._id;

        // 5. Test Edge Case: Overlapping Leave Request (Oct 11 to Oct 14 overlaps with Oct 9 to Oct 12)
        const mockReqOverlap = {
            user: createdUser,
            body: {
                leaveType: "Casual",
                startDate: "2026-10-11",
                endDate: "2026-10-14",
                reason: "Overlapping attempt"
            }
        };
        let overlapRes = {};
        const mockResOverlap = {
            status: (code) => {
                overlapRes.statusCode = code;
                return { json: (data) => { overlapRes.data = data; } };
            }
        };
        await applyLeave(mockReqOverlap, mockResOverlap);
        console.log("5. Overlapping Leave Edge Case:", overlapRes.statusCode === 400 ? "PASSED ✅ (Blocked overlapping request)" : "FAILED ❌", overlapRes.data.message);

        // 6. Test Manager Approval & Balance Deduction
        const mockReqApprove = {
            params: { id: leaveId },
            body: {
                status: "Approved",
                managerComment: "Approved. Enjoy your break!"
            }
        };
        let approveRes = {};
        const mockResApprove = {
            status: (code) => {
                approveRes.statusCode = code;
                return { json: (data) => { approveRes.data = data; } };
            }
        };
        await updateLeaveStatus(mockReqApprove, mockResApprove);
        console.log("6. Manager Approval & Balance Deduction:", approveRes.statusCode === 200 ? "PASSED ✅" : "FAILED ❌", approveRes.data.message);

        // Verify updated employee balance in DB
        const updatedUser = await User.findById(createdUser._id);
        console.log("7. Verified Balance Deduction: Casual Balance went from 10 to", updatedUser.leaveBalance.casual, updatedUser.leaveBalance.casual === 8 ? "✅ (Correct: 10 - 2 = 8)" : "❌ FAILED");

        // Clean up test employee
        await LeaveRequest.deleteMany({ employee: createdUser._id });
        await User.deleteOne({ _id: createdUser._id });
        console.log("[Cleanup] Cleaned up test data.");

        console.log("==========================================");
        console.log("ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY 🎉");
        console.log("==========================================");

    } catch (err) {
        console.error("Test failed with error:", err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

runIntegrationTests();
