import express from "express";
import mongoose from "mongoose";
import urlRoutes from "./routes/urlRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as view engine
app.set("view engine", "ejs");

// Get DB vars from .env
const { MONGO_HOST: host, MONGO_PORT: dbPort, MONGO_DB: db } = process.env;

// Connect MongoDB
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(`mongodb://${host}:${dbPort}/${db}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ Error connecting:", err));
}

// Routes
app.use("/", urlRoutes);

// Start Server (only if not in test mode)
if (process.env.NODE_ENV !== "test") {
  const port = process.env.APP_PORT || 3000;
  app.listen(port, () =>
    console.log(`✅ Server running on port ${port}`)
  );
}

// ✅ Export app for testing
export default app;
