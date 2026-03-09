import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { sendError } from "../utils/apiResponse.js";
import { securityLogger } from "../utils/logger.js";
import { extractAccessToken } from "../utils/tokenService.js";

const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

export const authMiddleware = async (req, res, next) => {
    const token = extractAccessToken(req);
    if (!token) {
        securityLogger.warn(
            { ip: req.ip, path: req.originalUrl },
            "Missing authentication token"
        );
        return sendError(res, { statusCode: 401, message: "no_token_provided" });
    }

    try {
        const decoded = jwt.verify(token, accessTokenSecret);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            securityLogger.warn(
                { userId: decoded.id, ip: req.ip, path: req.originalUrl },
                "Token user not found"
            );
            return sendError(res, { statusCode: 401, message: "user_not_found_auth_denied" });
        }
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        securityLogger.warn(
            { err: error, ip: req.ip, path: req.originalUrl },
            "Auth middleware token verification failed"
        );
        return sendError(res, { statusCode: 401, message: "invalid_token_auth_denied" });
    }

};
