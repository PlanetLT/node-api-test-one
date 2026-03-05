import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";

const createServiceError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

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

export { registerUser, loginUser };
