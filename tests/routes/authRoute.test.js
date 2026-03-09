import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/controllers/authController.js", () => ({
  register: vi.fn((_req, res) => res.status(201).json({ ok: "register" })),
  login: vi.fn((_req, res) => res.status(201).json({ ok: "login" })),
  refreshAccessToken: vi.fn((_req, res) => res.status(200).json({ ok: "refresh" })),
  logout: vi.fn((_req, res) => res.status(200).json({ ok: "logout" })),
}));

import authRoute from "../../src/routes/authRoute.js";
import * as authController from "../../src/controllers/authController.js";

describe("auth routes", () => {
  const findRouteLayer = (path, method) =>
    authRoute.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method]
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /register is wired", () => {
    const layer = findRouteLayer("/register", "post");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(authController.register).toHaveBeenCalled();
  });

  it("POST /login is wired", () => {
    const layer = findRouteLayer("/login", "post");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(authController.login).toHaveBeenCalled();
  });

  it("POST /logout is wired", () => {
    const layer = findRouteLayer("/logout", "post");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(authController.logout).toHaveBeenCalled();
  });

  it("POST /refresh is wired", () => {
    const layer = findRouteLayer("/refresh", "post");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(authController.refreshAccessToken).toHaveBeenCalled();
  });
});
