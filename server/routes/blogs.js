import express from "express";
import { Op } from "sequelize";
import { BlogPost, User, Like, Comment } from "../models/index.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import {
	blogPostValidation,
	validateRequest,
} from "../middleware/validation.js";

const router = express.Router();

// Get all blog posts with pagination and filtering
router.get("/", optionalAuth, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			country,
			author,
			sortBy = "createdAt",
			sortOrder = "DESC",
		} = req.query;

		const offset = (page - 1) * limit;
		const where = { isPublished: true };

		// Add filters
		if (country) {
			where.country = { [Op.like]: `%${country}%` };
		}

		// Include options
		const include = [
			{
				model: User,
				as: "author",
				attributes: [
					"id",
					"username",
					"firstName",
					"lastName",
					"profileImage",
				],
				...(author && {
					where: {
						username: { [Op.like]: `%${author}%` },
					},
				}),
			},
		];

		// Add user's like status if authenticated
		if (req.user) {
			include.push({
				model: Like,
				as: "likes",
				where: { userId: req.user.id },
				required: false,
				attributes: ["isLike"],
			});
		}

		const { rows: blogPosts, count: total } =
			await BlogPost.findAndCountAll({
				where,
				include,
				limit: parseInt(limit),
				offset: parseInt(offset),
				order: [[sortBy, sortOrder.toUpperCase()]],
				distinct: true,
			});

		const totalPages = Math.ceil(total / limit);

		res.json({
			blogPosts: blogPosts.map((post) => ({
				...post.toJSON(),
				userLiked: req.user
					? post.likes?.length > 0
						? post.likes[0].isLike
						: null
					: null,
				likes: undefined, // Remove the likes array from response
			})),
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get blog posts error:", error);
		res.status(500).json({ error: "Failed to retrieve blog posts" });
	}
});

// Get single blog post by ID
router.get("/:id", optionalAuth, async (req, res) => {
	try {
		const { id } = req.params;

		const include = [
			{
				model: User,
				as: "author",
				attributes: [
					"id",
					"username",
					"firstName",
					"lastName",
					"profileImage",
					"bio",
				],
			},
			{
				model: Comment,
				as: "comments",
				include: [
					{
						model: User,
						as: "author",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"profileImage",
						],
					},
				],
				order: [["createdAt", "ASC"]],
			},
		];

		// Add user's like status if authenticated
		if (req.user) {
			include.push({
				model: Like,
				as: "likes",
				where: { userId: req.user.id },
				required: false,
				attributes: ["isLike"],
			});
		}

		const blogPost = await BlogPost.findOne({
			where: { id, isPublished: true },
			include,
		});

		if (!blogPost) {
			return res.status(404).json({ error: "Blog post not found" });
		}

		res.json({
			...blogPost.toJSON(),
			userLiked: req.user
				? blogPost.likes?.length > 0
					? blogPost.likes[0].isLike
					: null
				: null,
			likes: undefined, // Remove the likes array from response
		});
	} catch (error) {
		console.error("Get blog post error:", error);
		res.status(500).json({ error: "Failed to retrieve blog post" });
	}
});

// Create new blog post
router.post(
	"/",
	authenticateToken,
	blogPostValidation,
	validateRequest,
	async (req, res) => {
		try {
			const { title, content, country, visitDate, tags, images } =
				req.body;
			const userId = req.user.id;

			const blogPost = await BlogPost.create({
				title,
				content,
				country,
				visitDate,
				tags: tags || [],
				images: images || [],
				userId,
			});

			// Fetch the created post with author info
			const createdPost = await BlogPost.findByPk(blogPost.id, {
				include: [
					{
						model: User,
						as: "author",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"profileImage",
						],
					},
				],
			});

			res.status(201).json({
				message: "Blog post created successfully",
				blogPost: createdPost,
			});
		} catch (error) {
			console.error("Create blog post error:", error);
			res.status(500).json({ error: "Failed to create blog post" });
		}
	}
);

// Update blog post
router.put(
	"/:id",
	authenticateToken,
	blogPostValidation,
	validateRequest,
	async (req, res) => {
		try {
			const { id } = req.params;
			const { title, content, country, visitDate, tags, images } =
				req.body;
			const userId = req.user.id;

			const blogPost = await BlogPost.findOne({
				where: { id, userId },
			});

			if (!blogPost) {
				return res
					.status(404)
					.json({ error: "Blog post not found or unauthorized" });
			}

			await blogPost.update({
				title,
				content,
				country,
				visitDate,
				tags: tags || [],
				images: images || [],
			});

			// Fetch updated post with author info
			const updatedPost = await BlogPost.findByPk(id, {
				include: [
					{
						model: User,
						as: "author",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"profileImage",
						],
					},
				],
			});

			res.json({
				message: "Blog post updated successfully",
				blogPost: updatedPost,
			});
		} catch (error) {
			console.error("Update blog post error:", error);
			res.status(500).json({ error: "Failed to update blog post" });
		}
	}
);

// Delete blog post
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const blogPost = await BlogPost.findOne({
			where: { id, userId },
		});

		if (!blogPost) {
			return res
				.status(404)
				.json({ error: "Blog post not found or unauthorized" });
		}

		await blogPost.destroy();

		res.json({ message: "Blog post deleted successfully" });
	} catch (error) {
		console.error("Delete blog post error:", error);
		res.status(500).json({ error: "Failed to delete blog post" });
	}
});

// Like/Unlike blog post
router.post("/:id/like", authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { isLike } = req.body; // true for like, false for dislike
		const userId = req.user.id;

		const blogPost = await BlogPost.findByPk(id);
		if (!blogPost) {
			return res.status(404).json({ error: "Blog post not found" });
		}

		// Check if user already liked/disliked this post
		const existingLike = await Like.findOne({
			where: { userId, blogPostId: id },
		});

		if (existingLike) {
			if (existingLike.isLike === isLike) {
				// User is trying to like/dislike again, so remove the like/dislike
				await existingLike.destroy();

				// Update blog post like count
				const likeCount = await Like.count({
					where: { blogPostId: id, isLike: true },
				});
				await blogPost.update({ likesCount: likeCount });

				return res.json({
					message: "Like removed",
					likesCount: likeCount,
					userLiked: null,
				});
			} else {
				// User is changing from like to dislike or vice versa
				await existingLike.update({ isLike });
			}
		} else {
			// Create new like/dislike
			await Like.create({ userId, blogPostId: id, isLike });
		}

		// Update blog post like count
		const likeCount = await Like.count({
			where: { blogPostId: id, isLike: true },
		});
		await blogPost.update({ likesCount: likeCount });

		res.json({
			message: isLike ? "Post liked" : "Post disliked",
			likesCount: likeCount,
			userLiked: isLike,
		});
	} catch (error) {
		console.error("Like/Unlike blog post error:", error);
		res.status(500).json({ error: "Failed to like/unlike blog post" });
	}
});

// Add comment to blog post
router.post("/:id/comments", authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { content } = req.body;
		const userId = req.user.id;

		if (!content || content.trim().length === 0) {
			return res
				.status(400)
				.json({ error: "Comment content is required" });
		}

		if (content.length > 1000) {
			return res
				.status(400)
				.json({ error: "Comment must not exceed 1000 characters" });
		}

		const blogPost = await BlogPost.findByPk(id);
		if (!blogPost) {
			return res.status(404).json({ error: "Blog post not found" });
		}

		const comment = await Comment.create({
			content: content.trim(),
			userId,
			blogPostId: id,
		});

		// Update blog post comment count
		const commentCount = await Comment.count({
			where: { blogPostId: id },
		});
		await blogPost.update({ commentsCount: commentCount });

		// Fetch the created comment with author info
		const createdComment = await Comment.findByPk(comment.id, {
			include: [
				{
					model: User,
					as: "author",
					attributes: [
						"id",
						"username",
						"firstName",
						"lastName",
						"profileImage",
					],
				},
			],
		});

		res.status(201).json({
			message: "Comment added successfully",
			comment: createdComment,
			commentsCount: commentCount,
		});
	} catch (error) {
		console.error("Add comment error:", error);
		res.status(500).json({ error: "Failed to add comment" });
	}
});

// Get user's own blog posts
router.get("/user/me", authenticateToken, async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;
		const userId = req.user.id;

		const { rows: blogPosts, count: total } =
			await BlogPost.findAndCountAll({
				where: { userId },
				include: [
					{
						model: User,
						as: "author",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"profileImage",
						],
					},
				],
				limit: parseInt(limit),
				offset: parseInt(offset),
				order: [["createdAt", "DESC"]],
			});

		const totalPages = Math.ceil(total / limit);

		res.json({
			blogPosts,
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get user blog posts error:", error);
		res.status(500).json({ error: "Failed to retrieve blog posts" });
	}
});

// Get blog posts from followed users
router.get("/feed/following", authenticateToken, async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;
		const userId = req.user.id;

		// Get IDs of users that current user follows
		const user = await User.findByPk(userId, {
			include: [
				{
					model: User,
					as: "following",
					attributes: ["id"],
					through: { attributes: [] },
				},
			],
		});

		const followingIds = user.following.map((u) => u.id);

		if (followingIds.length === 0) {
			return res.json({
				blogPosts: [],
				pagination: {
					currentPage: parseInt(page),
					totalPages: 0,
					totalItems: 0,
					hasNext: false,
					hasPrev: false,
				},
			});
		}

		const { rows: blogPosts, count: total } =
			await BlogPost.findAndCountAll({
				where: {
					userId: { [Op.in]: followingIds },
					isPublished: true,
				},
				include: [
					{
						model: User,
						as: "author",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"profileImage",
						],
					},
					{
						model: Like,
						as: "likes",
						where: { userId },
						required: false,
						attributes: ["isLike"],
					},
				],
				limit: parseInt(limit),
				offset: parseInt(offset),
				order: [["createdAt", "DESC"]],
				distinct: true,
			});

		const totalPages = Math.ceil(total / limit);

		res.json({
			blogPosts: blogPosts.map((post) => ({
				...post.toJSON(),
				userLiked: post.likes?.length > 0 ? post.likes[0].isLike : null,
				likes: undefined,
			})),
			pagination: {
				currentPage: parseInt(page),
				totalPages,
				totalItems: total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get following feed error:", error);
		res.status(500).json({ error: "Failed to retrieve following feed" });
	}
});

export default router;
