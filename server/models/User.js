import { DataTypes } from "sequelize";

export const defineUser = (sequelize) => {
	return sequelize.define(
		"User",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: DataTypes.STRING(50),
				allowNull: false,
				unique: true,
				validate: {
					len: [3, 50],
					isAlphanumeric: true,
				},
			},
			email: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
			},
			passwordHash: {
				type: DataTypes.STRING(255),
				allowNull: false,
				field: "password_hash",
			},
			firstName: {
				type: DataTypes.STRING(50),
				allowNull: true,
				field: "first_name",
			},
			lastName: {
				type: DataTypes.STRING(50),
				allowNull: true,
				field: "last_name",
			},
			bio: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			profileImage: {
				type: DataTypes.STRING(255),
				allowNull: true,
				field: "profile_image",
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
				field: "is_active",
			},
		},
		{
			tableName: "users",
			indexes: [
				{
					unique: true,
					fields: ["username"],
				},
				{
					unique: true,
					fields: ["email"],
				},
			],
		}
	);
};
