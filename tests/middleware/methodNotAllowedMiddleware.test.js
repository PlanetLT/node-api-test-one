import { describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";
import {
  methodNotAllowedMiddleware,
  notFoundMiddleware,
} from "../../src/middleware/methodNotAllowedMiddleware.js";

describe("methodNotAllowedMiddleware", () => {
  it("returns 405 for unsupported method on known route", async () => {
    const req = { method: "GET", path: "/auth/login" };
    const res = createMockRes();
    const next = vi.fn();

    methodNotAllowedMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith("Allow", "POST");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Method GET not allowed for /auth/login",
      errors: { allowedMethods: ["POST"] },
    });
  });

  it("passes through when method is allowed", () => {
    const req = { method: "POST", path: "/auth/login" };
    const res = createMockRes();
    const next = vi.fn();

    methodNotAllowedMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown route", () => {
    const req = { method: "GET", path: "/unknown" };
    const res = createMockRes();

    notFoundMiddleware(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Route GET /unknown not found",
      errors: null,
    });
  });
});
