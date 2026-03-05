import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { sendError } from "../utils/apiResponse.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return sendError(res, { statusCode: 401, message: "No token provided, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return sendError(res, { statusCode: 401, message: "User not found, authorization denied" });
        }
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return sendError(res, { statusCode: 401, message: "Invalid token, authorization denied" });
    }

};
