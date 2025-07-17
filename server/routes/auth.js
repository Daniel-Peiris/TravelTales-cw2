import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
	registerValidation,
	loginValidation,
	validateRequest,
} from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

// Register
router.post(
	"/register",
	registerValidation,
	validateRequest,
	async (req, res) => {
		try {
			const { username, email, password, firstName, lastName } = req.body;

			// Check if user already exists
			const existingUser = await User.findOne({
				where: {
					[Op.or]: [{ email }, { username }],
				},
			});

			if (existingUser) {
				return res.status(409).json({
					error: "User already exists with this email or username",
				});
			}

			// Hash password
			const saltRounds = 12;
			const passwordHash = await bcrypt.hash(password, saltRounds);

			// Create user
			const user = await User.create({
				username,
				email,
				passwordHash,
				firstName: firstName || null,
				lastName: lastName || null,
			});

			// Generate JWT token
			const token = jwt.sign(
				{ userId: user.id, username: user.username },
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
			);

			// Return user data (excluding password)
			res.status(201).json({
				message: "User registered successfully",
				token,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt,
				},
			});
		} catch (error) {
			console.error("Registration error:", error);
			res.status(500).json({ error: "Failed to register user" });
		}
	}
);

// Login
router.post("/login", loginValidation, validateRequest, async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({
			where: { email, isActive: true },
		});

		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		// Check password
		const isValidPassword = await bcrypt.compare(
			password,
			user.passwordHash
		);
		if (!isValidPassword) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
		);

		res.json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				bio: user.bio,
				profileImage: user.profileImage,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Failed to login" });
	}
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
	try {
		const user = await User.findByPk(req.user.id, {
			attributes: [
				"id",
				"username",
				"email",
				"firstName",
				"lastName",
				"bio",
				"profileImage",
				"createdAt",
			],
		});

		res.json(user);
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({ error: "Failed to get user data" });
	}
});

// Update current user profile
router.put("/profile", authenticateToken, async (req, res) => {
	try {
		const { firstName, lastName, bio } = req.body;
		const userId = req.user.id;

		await User.update(
			{ firstName, lastName, bio },
			{ where: { id: userId } }
		);

		const updatedUser = await User.findByPk(userId, {
			attributes: [
				"id",
				"username",
				"email",
				"firstName",
				"lastName",
				"bio",
				"profileImage",
			],
		});

		res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Profile update error:", error);
		res.status(500).json({ error: "Failed to update profile" });
	}
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Validate new password
		if (!newPassword || newPassword.length < 8) {
			return res.status(400).json({
				error: "New password must be at least 8 characters long",
			});
		}

		// Get user with current password
		const user = await User.findByPk(userId);

		// Verify current password
		const isValidPassword = await bcrypt.compare(
			currentPassword,
			user.passwordHash
		);
		if (!isValidPassword) {
			return res
				.status(401)
				.json({ error: "Current password is incorrect" });
		}

		// Hash new password
		const saltRounds = 12;
		const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

		// Update password
		await User.update(
			{ passwordHash: newPasswordHash },
			{ where: { id: userId } }
		);

		res.json({ message: "Password changed successfully" });
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({ error: "Failed to change password" });
	}
});

// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.id;

		// Generate new token
		const token = jwt.sign(
			{ userId, username: req.user.username },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
		);

		res.json({ token });
	} catch (error) {
		console.error("Token refresh error:", error);
		res.status(500).json({ error: "Failed to refresh token" });
	}
});

export default router;
