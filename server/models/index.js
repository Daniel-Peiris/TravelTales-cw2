import { Sequelize } from "sequelize";
import { defineUser } from "./User.js";
import { defineBlogPost } from "./BlogPost.js";
import { defineLike } from "./Like.js";
import { defineFollow } from "./Follow.js";
import { defineComment } from "./Comment.js";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: process.env.DATABASE_PATH || "./database/traveltales.db",
	logging: process.env.NODE_ENV === "development" ? console.log : false,
	define: {
		timestamps: true,
		underscored: true,
	},
});

// Initialize models
const User = defineUser(sequelize);
const BlogPost = defineBlogPost(sequelize);
const Like = defineLike(sequelize);
const Follow = defineFollow(sequelize);
const Comment = defineComment(sequelize);

// Define associations
User.hasMany(BlogPost, { foreignKey: "userId", as: "blogPosts" });
BlogPost.belongsTo(User, { foreignKey: "userId", as: "author" });

User.hasMany(Like, { foreignKey: "userId", as: "likes" });
Like.belongsTo(User, { foreignKey: "userId", as: "user" });

BlogPost.hasMany(Like, { foreignKey: "blogPostId", as: "likes" });
Like.belongsTo(BlogPost, { foreignKey: "blogPostId", as: "blogPost" });

User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });

BlogPost.hasMany(Comment, { foreignKey: "blogPostId", as: "comments" });
Comment.belongsTo(BlogPost, { foreignKey: "blogPostId", as: "blogPost" });

// Follow associations (many-to-many self-referencing)
User.belongsToMany(User, {
	through: Follow,
	as: "following",
	foreignKey: "followerId",
	otherKey: "followingId",
});

User.belongsToMany(User, {
	through: Follow,
	as: "followers",
	foreignKey: "followingId",
	otherKey: "followerId",
});

export { sequelize, User, BlogPost, Like, Follow, Comment };
