export const errorHandler = (err, req, res, next) => {
	console.error("Error:", err);

	// Sequelize validation errors
	if (err.name === "SequelizeValidationError") {
		const errors = err.errors.map((error) => ({
			field: error.path,
			message: error.message,
		}));
		return res.status(400).json({
			error: "Validation error",
			details: errors,
		});
	}

	// Sequelize unique constraint errors
	if (err.name === "SequelizeUniqueConstraintError") {
		return res.status(409).json({
			error: "Resource already exists",
			field: err.errors[0]?.path,
		});
	}

	// JWT errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({ error: "Invalid token" });
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({ error: "Token expired" });
	}

	// Default error
	res.status(err.status || 500).json({
		error: err.message || "Internal server error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};