import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { createServiceError } from "../utils/serviceError.js";

const registerUser = async ({ name, email, password }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw createServiceError(400, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    return { id: user.id, name: user.name, email: user.email };
};

const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw createServiceError(400, "name, email, and password are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        throw createServiceError(400, "User does not exist");
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        throw createServiceError(400, "Invalid password");
    }

    return {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
    };
};

const createRefreshTokenSession = async ({ userId, tokenHash, expiresAt }) =>
    prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

const findActiveRefreshToken = async ({ userId, tokenHash }) =>
    prisma.refreshToken.findFirst({
        where: {
            userId,
            tokenHash,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

const revokeRefreshTokenByHash = async ({ userId, tokenHash }) =>
    prisma.refreshToken.updateMany({
        where: {
            userId,
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

const revokeAllUserRefreshTokens = async (userId) =>
    prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

export {
    registerUser,
    loginUser,
    createRefreshTokenSession,
    findActiveRefreshToken,
    revokeRefreshTokenByHash,
    revokeAllUserRefreshTokens,
};
