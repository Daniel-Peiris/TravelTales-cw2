import { DataTypes } from "sequelize";

export const defineLike = (sequelize) => {
	return sequelize.define(
		"Like",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
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
			isLike: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				field: "is_like",
			},
		},
		{
			tableName: "likes",
			indexes: [
				{
					unique: true,
					fields: ["user_id", "blog_post_id"],
				},
			],
		}
	);
};
