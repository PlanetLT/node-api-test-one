import {
    createRefreshTokenSession,
    findActiveRefreshToken,
    loginUser,
    registerUser,
    revokeAllUserRefreshTokens,
    revokeRefreshTokenByHash,
} from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { auditLogger, securityLogger } from "../utils/logger.js";
import {
    clearAuthCookies,
    extractRefreshToken,
    hashToken,
    setAuthCookies,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../utils/tokenService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const sendAuthError = (res, error, req) => {
    if (error?.status) {
        return sendError(res, { statusCode: error.status, message: error.message });
    }

    if (error?.code === "ECONNREFUSED" || error?.code === "DB_NOT_CONFIGURED") {
        return sendError(res, {
            statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
            message: "database_unavailable",
        });
    }

    return sendError(res);
};

const createTokenPair = (userId) => {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    return { accessToken, refreshToken };
};

const getRefreshTokenExpiryDate = () => {
    const fallbackMs = 7 * 24 * 60 * 60 * 1000;
    const configuredMs = Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || fallbackMs;
    return new Date(Date.now() + configuredMs);
};

const persistRefreshToken = async ({ userId, refreshToken }) => {
    await createRefreshTokenSession({
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshTokenExpiryDate(),
    });
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};
        const user = await registerUser({ name, email, password });
        const { accessToken, refreshToken } = createTokenPair(user.id);
        await persistRefreshToken({ userId: user.id, refreshToken });
        setAuthCookies(res, { accessToken, refreshToken });
        auditLogger.info({ userId: user.id, email: user.email }, "User registered");
        return sendSuccess(res, {
            statusCode: HTTP_STATUS.CREATED,
            message: "user_registered",
            data: { user, accessToken, refreshToken },
        });
    } catch (error) {
        securityLogger.error({ err: error, email: req.body?.email }, "Register error");
        return sendAuthError(res, error, req);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        const user = await loginUser({ email, password });
        const { accessToken, refreshToken } = createTokenPair(user.id);
        await persistRefreshToken({ userId: user.id, refreshToken });
        setAuthCookies(res, { accessToken, refreshToken });
        auditLogger.info({ userId: user.id, email: user.email }, "User logged in");

        return sendSuccess(res, {
            statusCode: HTTP_STATUS.CREATED,
            message: "login_success",
            data: { user, accessToken, refreshToken },
        });
    } catch (error) {
        securityLogger.warn({ err: error, email: req.body?.email }, "Login error");
        return sendAuthError(res, error, req);
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = extractRefreshToken(req);
        if (!refreshToken) {
            return sendError(res, { statusCode: HTTP_STATUS.UNAUTHORIZED, message: "token_required" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const tokenHash = hashToken(refreshToken);
        const activeRefreshToken = await findActiveRefreshToken({
            userId: decoded.id,
            tokenHash,
        });

        if (!activeRefreshToken) {
            return sendError(res, { statusCode: HTTP_STATUS.UNAUTHORIZED, message: "invalid_token" });
        }

        await revokeRefreshTokenByHash({ userId: decoded.id, tokenHash });

        const nextAccessToken = signAccessToken(decoded.id);
        const nextRefreshToken = signRefreshToken(decoded.id);
        await persistRefreshToken({ userId: decoded.id, refreshToken: nextRefreshToken });
        setAuthCookies(res, { accessToken: nextAccessToken, refreshToken: nextRefreshToken });

        return sendSuccess(res, {
            message: "access_token_refreshed",
            data: { accessToken: nextAccessToken, refreshToken: nextRefreshToken },
        });
    } catch (error) {
        securityLogger.warn({ err: error, ip: req.ip }, "Refresh token error");
        return sendError(res, {
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: "invalid_or_expired_refresh_token",
        });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = extractRefreshToken(req);
        if (refreshToken) {
            try {
                const decoded = verifyRefreshToken(refreshToken);
                await revokeRefreshTokenByHash({
                    userId: decoded.id,
                    tokenHash: hashToken(refreshToken),
                });
            } catch (_error) {
                // Continue logout even if refresh token cannot be decoded.
            }
        } else if (req.user?.id) {
            await revokeAllUserRefreshTokens(req.user.id);
        }
    } finally {
        clearAuthCookies(res);
    }

    auditLogger.info(
        { userId: req.user?.id || null, email: req.user?.email || null },
        "User logged out"
    );
    return sendSuccess(res, { message: "user_logged_out" });
};

export { register, login, refreshAccessToken, logout };
