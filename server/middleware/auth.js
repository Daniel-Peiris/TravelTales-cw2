import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: [
                "id",
                "username",
                "email",
                "firstName",
                "lastName",
                "isActive",
            ],
        });

        if (!user || !user.isActive) {
            return res
                .status(401)
                .json({ error: "Invalid token or user inactive" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.userId, {
                attributes: [
                    "id",
                    "username",
                    "email",
                    "firstName",
                    "lastName",
                    "isActive",
                ],
            });

            if (user && user.isActive) {
                req.user = user;
            }
        } catch (error) {
            // Continue without authentication
        }
    }

    next();
};
