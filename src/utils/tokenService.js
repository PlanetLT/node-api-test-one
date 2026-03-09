import crypto from "crypto";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const accessTokenMaxAgeMs =
  Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS) || 15 * 60 * 1000;
const refreshTokenMaxAgeMs =
  Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) ||
  7 * 24 * 60 * 60 * 1000;

const cookieBaseOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: isProduction,
};

const createTokenConfigError = (message) => {
  const error = new Error(message);
  error.status = 500;
  return error;
};

const getCookieValue = (req, cookieName) => {
  if (req.cookies?.[cookieName]) {
    return req.cookies[cookieName];
  }

  const rawCookieHeader = req.headers?.cookie;
  if (!rawCookieHeader) {
    return null;
  }

  const parsedCookie = rawCookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`));

  return parsedCookie
    ? decodeURIComponent(parsedCookie.split("=").slice(1).join("="))
    : null;
};

const signAccessToken = (userId) => {
  if (!accessTokenSecret) {
    throw createTokenConfigError("ACCESS_TOKEN_SECRET is required");
  }
  return jwt.sign({ id: userId }, accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
  });
};

const signRefreshToken = (userId) => {
  if (!refreshTokenSecret) {
    throw createTokenConfigError("REFRESH_TOKEN_SECRET is required");
  }
  return jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  });
};

const verifyAccessToken = (token) => jwt.verify(token, accessTokenSecret);

const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenSecret);

/*
JWE version kept for reference (not active):

import { EncryptJWT, jwtDecrypt } from "jose";

const buildSymmetricKey = (secret, envKeyName) => {
  if (!secret) {
    throw createTokenConfigError(`${envKeyName} is required`);
  }
  return crypto.createHash("sha256").update(secret).digest();
};

const signAccessToken = async (userId) => {
  const key = buildSymmetricKey(
    accessTokenSecret,
    "ACCESS_TOKEN_SECRET or JWT_SECRET"
  );
  return new EncryptJWT({ id: userId, type: "access" })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiresIn)
    .encrypt(key);
};

const signRefreshToken = async (userId) => {
  const key = buildSymmetricKey(
    refreshTokenSecret,
    "REFRESH_TOKEN_SECRET or JWT_SECRET"
  );
  return new EncryptJWT({ id: userId, type: "refresh" })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiresIn)
    .encrypt(key);
};

const verifyAccessToken = async (token) => {
  const key = buildSymmetricKey(
    accessTokenSecret,
    "ACCESS_TOKEN_SECRET or JWT_SECRET"
  );
  const { payload } = await jwtDecrypt(token, key);
  return payload;
};

const verifyRefreshToken = async (token) => {
  const key = buildSymmetricKey(
    refreshTokenSecret,
    "REFRESH_TOKEN_SECRET or JWT_SECRET"
  );
  const { payload } = await jwtDecrypt(token, key);
  return payload;
};
*/

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, {
    ...cookieBaseOptions,
    maxAge: accessTokenMaxAgeMs,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieBaseOptions,
    maxAge: refreshTokenMaxAgeMs,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieBaseOptions);
  res.clearCookie("refreshToken", cookieBaseOptions);
};

const extractAccessToken = (req) =>
  getCookieValue(req, "accessToken") ||
  getCookieValue(req, "token") ||
  req.headers.authorization?.split(" ")[1] ||
  null;

const extractRefreshToken = (req) =>
  getCookieValue(req, "refreshToken") || req.body?.refreshToken || null;

export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  extractAccessToken,
  extractRefreshToken,
};
