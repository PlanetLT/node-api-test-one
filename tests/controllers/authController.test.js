import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/services/authService.js", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  createRefreshTokenSession: vi.fn(),
  findActiveRefreshToken: vi.fn(),
  revokeRefreshTokenByHash: vi.fn(),
  revokeAllUserRefreshTokens: vi.fn(),
}));

vi.mock("../../src/utils/tokenService.js", () => ({
  clearAuthCookies: vi.fn(),
  extractRefreshToken: vi.fn(),
  hashToken: vi.fn(),
  setAuthCookies: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

import {
  registerUser,
  loginUser,
  createRefreshTokenSession,
} from "../../src/services/authService.js";
import {
  clearAuthCookies,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from "../../src/utils/tokenService.js";
import {
  register,
  login,
  logout,
  refreshAccessToken,
} from "../../src/controllers/authController.js";

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register returns 201 with user and token", async () => {
    registerUser.mockResolvedValue({ id: "u1", name: "A", email: "a@a.com" });
    signAccessToken.mockReturnValue("access-1");
    signRefreshToken.mockReturnValue("refresh-1");
    createRefreshTokenSession.mockResolvedValue({});
    const req = { body: { name: "A", email: "a@a.com", password: "secret" } };
    const res = createMockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully",
      })
    );
    expect(setAuthCookies).toHaveBeenCalledWith(res, {
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });
  });

  it("refresh returns 401 when refresh token is missing", async () => {
    const req = {};
    const res = createMockRes();

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Refresh token is required",
      })
    );
  });

  it("login returns service error status", async () => {
    loginUser.mockRejectedValue({ status: 400, message: "Invalid password" });
    const req = { body: { email: "a@a.com", password: "wrong" } };
    const res = createMockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Invalid password" })
    );
  });

  it("logout clears auth cookies and returns success", async () => {
    const req = {};
    const res = createMockRes();

    await logout(req, res);

    expect(clearAuthCookies).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
