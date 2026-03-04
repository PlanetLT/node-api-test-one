import jwt from "jsonwebtoken";
import "dotenv/config";
export const generateToken = (userId,res) => {
    const payload = { id: userId };
    const token= jwt.sign(payload, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRES_IN });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60  // 1 hour
    });
    return token;
}