import { DataTypes } from "sequelize";

export const defineFollow = (sequelize) => {
	return sequelize.define(
		"Follow",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			followerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "follower_id",
				references: {
					model: "users",
					key: "id",
				},
			},
			followingId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "following_id",
				references: {
					model: "users",
					key: "id",
				},
			},
		},
		{
			tableName: "follows",
			indexes: [
				{
					unique: true,
					fields: ["follower_id", "following_id"],
				},
			],
		}
	);
};
