import { DataTypes } from "sequelize";

export const defineBlogPost = (sequelize) => {
	return sequelize.define(
		"BlogPost",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING(200),
				allowNull: false,
				validate: {
					len: [5, 200],
				},
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					len: [10, 50000],
				},
			},
			country: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			visitDate: {
				type: DataTypes.DATEONLY,
				allowNull: false,
				field: "visit_date",
			},
			images: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [],
			},
			tags: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [],
			},
			isPublished: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
				field: "is_published",
			},
			likesCount: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				field: "likes_count",
			},
			commentsCount: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				field: "comments_count",
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "user_id",
				references: {
					model: "users",
					key: "id",
				},
			},
		},
		{
			tableName: "blog_posts",
			indexes: [
				{
					fields: ["user_id"],
				},
				{
					fields: ["country"],
				},
				{
					fields: ["created_at"],
				},
				{
					fields: ["likes_count"],
				},
			],
		}
	);
};
