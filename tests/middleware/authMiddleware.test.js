import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../src/config/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import jwt from "jsonwebtoken";
import { prisma } from "../../src/config/db.js";
import { authMiddleware } from "../../src/middleware/authMiddleware.js";

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when token is missing", async () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches user and calls next when token is valid", async () => {
    jwt.verify.mockReturnValue({ id: "u1" });
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: "u@u.com" });
    const req = { headers: { authorization: "Bearer tkn" } };
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: "u1", email: "u@u.com" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 401 when token is invalid", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });
    const req = { headers: { authorization: "Bearer bad" } };
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
