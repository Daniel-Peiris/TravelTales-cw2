import express from "express";
import { Op } from "sequelize";
import { User, BlogPost, Follow } from "../models/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get user profile by username
router.get("/:username", async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({
			where: { username, isActive: true },
			attributes: [
				"id",
				"username",
				"firstName",
				"lastName",
				"bio",
				"profileImage",
				"createdAt",
			],
			include: [
				{
					model: BlogPost,
					as: "blogPosts",
					where: { isPublished: true },
					required: false,
					attributes: [
						"id",
						"title",
						"country",
						"visitDate",
						"likesCount",
						"commentsCount",
						"createdAt",
					],
					limit: 5,
					order: [["createdAt", "DESC"]],
				},
			],
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Get follower and following counts
		const [followerCount, followingCount] = await Promise.all([
			Follow.count({ where: { followingId: user.id } }),
			Follow.count({ where: { followerId: user.id } }),
		]);

		// Check if current user is following this user
		let isFollowing = false;
		if (req.user && req.user.id !== user.id) {
			const followRelation = await Follow.findOne({
				where: { followerId: req.user.id, followingId: user.id },
			});
			isFollowing = !!followRelation;
		}

		res.json({
			...user.toJSON(),
			followerCount,
			followingCount,
			isFollowing,
		});
	} catch (error) {
		console.error("Get user profile error:", error);
		res.status(500).json({ error: "Failed to retrieve user profile" });
	}
});

// Follow/Unfollow user
router.post("/:username/follow", authenticateToken, async (req, res) => {
	try {
		const { username } = req.params;
		const followerId = req.user.id;

		const userToFollow = await User.findOne({
			where: { username, isActive: true },
		});

		if (!userToFollow) {
			return res.status(404).json({ error: "User not found" });
		}

		if (userToFollow.id === followerId) {
			return res.status(400).json({ error: "Cannot follow yourself" });
		}

		const existingFollow = await Follow.findOne({
			where: { followerId, followingId: userToFollow.id },
		});

		if (existingFollow) {
			// Unfollow
			await existingFollow.destroy();
			res.json({
				message: "User unfollowed successfully",
				isFollowing: false,
			});
		} else {
			// Follow
			await Follow.create({ followerId, followingId: userToFollow.id });
			res.json({
				message: "User followed successfully",
				isFollowing: true,
			});
		}
	} catch (error) {
		console.error("Follow/Unfollow error:", error);
		res.status(500).json({ error: "Failed to follow/unfollow user" });
	}
});

// Get user's followers
router.get("/:username/followers", async (req, res) => {
	try {
		const { username } = req.params;
		const { page = 1, limit = 20 } = req.query;
		const offset = (page - 1) * limit;

		const user = await User.findOne({
			where: { username, isActive: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const { rows: followers, count: total } = await User.findAndCountAll({
			include: [
				{
					model: User,
					as: "following",
					where: { id: user.id },
					through: { attributes: [] },
					attributes: [],
				},
			],
			attributes: [
				"id",
				"username",
				"firstName",
				"lastName",
				"profileImage",
			],
			limit: parseInt(limit),
			offset: parseInt(offset),
			distinct: true,
		});

		const totalPages = Math.ceil(total / limit);

		res.json({
			followers,
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get followers error:", error);
		res.status(500).json({ error: "Failed to retrieve followers" });
	}
});

// Get user's following
router.get("/:username/following", async (req, res) => {
	try {
		const { username } = req.params;
		const { page = 1, limit = 20 } = req.query;
		const offset = (page - 1) * limit;

		const user = await User.findOne({
			where: { username, isActive: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const { rows: following, count: total } = await User.findAndCountAll({
			include: [
				{
					model: User,
					as: "followers",
					where: { id: user.id },
					through: { attributes: [] },
					attributes: [],
				},
			],
			attributes: [
				"id",
				"username",
				"firstName",
				"lastName",
				"profileImage",
			],
			limit: parseInt(limit),
			offset: parseInt(offset),
			distinct: true,
		});

		const totalPages = Math.ceil(total / limit);

		res.json({
			following,
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get following error:", error);
		res.status(500).json({ error: "Failed to retrieve following" });
	}
});

// Search users
router.get("/search/:query", async (req, res) => {
	try {
		const { query } = req.params;
		const { page = 1, limit = 20 } = req.query;
		const offset = (page - 1) * limit;

		if (!query || query.trim().length < 2) {
			return res
				.status(400)
				.json({ error: "Search query must be at least 2 characters" });
		}

		const { rows: users, count: total } = await User.findAndCountAll({
			where: {
				[Op.or]: [
					{ username: { [Op.like]: `%${query.trim()}%` } },
					{ firstName: { [Op.like]: `%${query.trim()}%` } },
					{ lastName: { [Op.like]: `%${query.trim()}%` } },
				],
				isActive: true,
			},
			attributes: [
				"id",
				"username",
				"firstName",
				"lastName",
				"profileImage",
				"bio",
			],
			limit: parseInt(limit),
			offset: parseInt(offset),
		});

		const totalPages = Math.ceil(total / limit);

		res.json({
			users,
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Search users error:", error);
		res.status(500).json({ error: "Failed to search users" });
	}
});

export default router;
