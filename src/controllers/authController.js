
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email, and password are required" });
        }

        //check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        const token = generateToken(user.id, res);
        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.error("Register error:", error);
        if (error?.code === "ECONNREFUSED") {
            return res.status(503).json({ message: "Database is unavailable. Please try again later." });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ message: "name, email, and password are required" });
        }

        //check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = generateToken(existingUser.id, res);

        return res.status(201).json({
            message: "User logged in successfully",
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error?.code === "ECONNREFUSED") {
            return res.status(503).json({ message: "Database is unavailable. Please try again later." });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "User logged out successfully" });
}


export { register, login, logout };