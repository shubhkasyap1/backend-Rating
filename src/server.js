import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🚀 Starting Store Rating API...\n");

    // Check environment
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    console.log("✅ Environment variables loaded");

    // Connect database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🌐 Server running on http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("\n❌ Server startup failed");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();