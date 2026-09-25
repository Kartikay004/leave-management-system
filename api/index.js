const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/db");

let isConnecting = false;

module.exports = async (req, res) => {
    try {
        if (!isConnecting) {
            isConnecting = true;
            await connectDB();
        }
    } catch (err) {
        console.error("Vercel DB connection error:", err);
    }
    return app(req, res);
};
