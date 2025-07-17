import { DataTypes } from "sequelize";

export const defineComment = (sequelize) => {
	return sequelize.define(
		"Comment",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					len: [1, 1000],
				},
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
			blogPostId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "blog_post_id",
				references: {
					model: "blog_posts",
					key: "id",
				},
			},
		},
		{
			tableName: "comments",
			indexes: [
				{
					fields: ["blog_post_id"],
				},
				{
					fields: ["user_id"],
				},
			],
		}
	);
};
