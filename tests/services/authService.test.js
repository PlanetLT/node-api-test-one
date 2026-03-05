import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("bcryptjs", () => ({
  default: {
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../../src/config/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import bcrypt from "bcryptjs";
import { prisma } from "../../src/config/db.js";
import { registerUser, loginUser } from "../../src/services/authService.js";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registerUser creates user when email does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed");
    prisma.user.create.mockResolvedValue({
      id: "u1",
      name: "A",
      email: "a@a.com",
    });

    const result = await registerUser({
      name: "A",
      email: "a@a.com",
      password: "secret",
    });

    expect(result).toEqual({ id: "u1", name: "A", email: "a@a.com" });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it("registerUser throws when user exists", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1" });

    await expect(
      registerUser({ name: "A", email: "a@a.com", password: "secret" })
    ).rejects.toMatchObject({ status: 400, message: "User already exists" });
  });

  it("loginUser throws when email/password missing", async () => {
    await expect(loginUser({ email: "", password: "" })).rejects.toMatchObject({
      status: 400,
      message: "name, email, and password are required",
    });
  });

  it("loginUser returns user when credentials are valid", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "A",
      email: "a@a.com",
      password: "hashed",
    });
    bcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({ email: "a@a.com", password: "secret" });

    expect(result).toEqual({ id: "u1", name: "A", email: "a@a.com" });
  });
});
