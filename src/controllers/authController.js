import { generateToken } from "../utils/generateToken.js";
import { registerUser, loginUser } from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { auditLogger, securityLogger } from "../utils/logger.js";

const sendAuthError = (res, error) => {
    if (error?.status) {
        return sendError(res, { statusCode: error.status, message: error.message });
    }

    if (error?.code === "ECONNREFUSED" || error?.code === "DB_NOT_CONFIGURED") {
        return sendError(res, {
            statusCode: 503,
            message: "Database is unavailable. Please try again later.",
        });
    }

    return sendError(res);
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};
        const user = await registerUser({ name, email, password });
        const token = generateToken(user.id, res);
        auditLogger.info({ userId: user.id, email: user.email }, "User registered");
        return sendSuccess(res, {
            statusCode: 201,
            message: "User registered successfully",
            data: { user, token },
        });
    } catch (error) {
        securityLogger.error({ err: error, email: req.body?.email }, "Register error");
        return sendAuthError(res, error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        const user = await loginUser({ email, password });
        const token = generateToken(user.id, res);
        auditLogger.info({ userId: user.id, email: user.email }, "User logged in");

        return sendSuccess(res, {
            statusCode: 201,
            message: "User logged in successfully",
            data: { user, token },
        });
    } catch (error) {
        securityLogger.warn({ err: error, email: req.body?.email }, "Login error");
        return sendAuthError(res, error);
    }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    auditLogger.info(
        { userId: req.user?.id || null, email: req.user?.email || null },
        "User logged out"
    );
    return sendSuccess(res, { message: "User logged out successfully" });
};

export { register, login, logout };
