import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/services/authService.js", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));

vi.mock("../../src/utils/generateToken.js", () => ({
  generateToken: vi.fn(),
}));

import { registerUser, loginUser } from "../../src/services/authService.js";
import { generateToken } from "../../src/utils/generateToken.js";
import {
  register,
  login,
  logout,
} from "../../src/controllers/authController.js";

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register returns 201 with user and token", async () => {
    registerUser.mockResolvedValue({ id: "u1", name: "A", email: "a@a.com" });
    generateToken.mockReturnValue("token-1");
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

  it("logout clears cookie and returns success", () => {
    const req = {};
    const res = createMockRes();

    logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
