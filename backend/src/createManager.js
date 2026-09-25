require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const createManager = async () => {
    try {
        await connectDB();

        const existingManager = await User.findOne({
            email: "aman@gmail.com"
        });

        if (existingManager) {
            console.log("Manager already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "12345678",
            10
        );

        await User.create({
            name: "Aman",
            email: "aman@gmail.com",
            password: hashedPassword,
            role: "manager",
            leaveBalance: {
                casual: 10,
                sick: 10
            }
        });

        console.log("Manager created successfully");

        process.exit(0);

    } catch (error) {
        console.error("Error creating manager:", error);
        process.exit(1);
    }
};

createManager();