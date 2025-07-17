import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors.array(),
		});
	}
	next();
};

export const registerValidation = [
	body("username")
		.isLength({ min: 3, max: 50 })
		.withMessage("Username must be between 3 and 50 characters")
		.isAlphanumeric()
		.withMessage("Username must contain only letters and numbers"),
	body("email")
		.isEmail()
		.withMessage("Please provide a valid email address")
		.normalizeEmail(),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters long")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage(
			"Password must contain at least one lowercase letter, one uppercase letter, and one number"
		),
	body("firstName")
		.optional()
		.isLength({ max: 50 })
		.withMessage("First name must not exceed 50 characters"),
	body("lastName")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Last name must not exceed 50 characters"),
];

export const loginValidation = [
	body("email")
		.isEmail()
		.withMessage("Please provide a valid email address")
		.normalizeEmail(),
	body("password").notEmpty().withMessage("Password is required"),
];

export const blogPostValidation = [
	body("title")
		.isLength({ min: 5, max: 200 })
		.withMessage("Title must be between 5 and 200 characters"),
	body("content")
		.isLength({ min: 10, max: 50000 })
		.withMessage("Content must be between 10 and 50,000 characters"),
	body("country")
		.notEmpty()
		.withMessage("Country is required")
		.isLength({ max: 100 })
		.withMessage("Country name must not exceed 100 characters"),
	body("visitDate")
		.isISO8601()
		.withMessage("Visit date must be a valid date"),
	body("tags").optional().isArray().withMessage("Tags must be an array"),
];