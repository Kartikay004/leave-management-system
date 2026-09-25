const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (uri) {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 4000 // 4 seconds timeout for Atlas
            });
            console.log("MongoDB connected successfully via MONGO_URI");
            return;
        }
        throw new Error("MONGO_URI not provided in environment");
    } catch (error) {
        console.warn("Primary MongoDB Atlas connection warning:", error.message);
        try {
            console.log("Initializing local MongoMemoryServer fallback...");
            const { MongoMemoryServer } = require("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create();
            const memoryUri = mongod.getUri();
            await mongoose.connect(memoryUri);
            console.log("Connected to local In-Memory MongoDB successfully");

            // Auto-seed default manager account
            const User = require("../models/User");
            const bcrypt = require("bcryptjs");
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
        } catch (memError) {
            console.error("MongoDB connection failed completely:", memError.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;