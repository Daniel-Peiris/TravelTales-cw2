import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import blogRoutes from "./routes/blogs.js";
import countryRoutes from "./routes/countries.js";
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (req, res) => {
	res.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		service: "TravelTales API",
	});
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/countries", countryRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Database sync and server start
async function startServer() {
	try {
		await sequelize.authenticate();
		console.log("Database connection established successfully.");

		// Sync database (create tables if they don't exist)
		await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
		console.log("Database synced successfully.");

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
			console.log(
				`Environment: ${process.env.NODE_ENV || "development"}`
			);
		});
	} catch (error) {
		console.error("Unable to start server:", error);
		process.exit(1);
	}
}

startServer();
