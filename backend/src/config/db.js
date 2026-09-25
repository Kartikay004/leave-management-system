const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

let isConnected = false;

const seedManager = async () => {
    try {
        const existingManager = await User.findOne({ email: "aman@gmail.com" });
        if (!existingManager) {
            const hashedPassword = await bcrypt.hash("12345678", 10);
            await User.create({
                name: "Aman (Manager)",
                email: "aman@gmail.com",
                password: hashedPassword,
                role: "manager",
                leaveBalance: { casual: 10, sick: 10 }
            });
            console.log("Default Manager auto-seeded: aman@gmail.com / 12345678");
        }
    } catch (err) {
        console.error("Manager seed error:", err);
    }
};

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    const uri = process.env.MONGO_URI || "mongodb+srv://kartikaysrivastava31:kartikay2004@cluster0.rc82hrs.mongodb.net/leave_management?appName=Cluster0";

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        isConnected = true;
        console.log("MongoDB connected successfully via MONGO_URI");
        await seedManager();
        return;
    } catch (error) {
        console.warn("Primary MongoDB Atlas connection warning:", error.message);
        try {
            const { MongoMemoryServer } = require("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create();
            const memoryUri = mongod.getUri();
            await mongoose.connect(memoryUri);
            isConnected = true;
            console.log("Connected to local In-Memory MongoDB successfully");
            await seedManager();
        } catch (memError) {
            console.error("MongoDB connection failed:", memError.message);
        }
    }
};

module.exports = connectDB;