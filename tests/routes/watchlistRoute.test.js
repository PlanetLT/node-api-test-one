import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/middleware/authMiddleware.js", () => ({
  authMiddleware: vi.fn((req, _res, next) => {
    req.user = { id: "u1" };
    next();
  }),
}));
vi.mock("../../src/middleware/validationRequest.js", () => ({
  validateRequest: vi.fn(() => (_req, _res, next) => next()),
}));
vi.mock("../../src/controllers/watchlistController.js", () => ({
  addToWatchlist: vi.fn((_req, res) => res.status(201).json({ ok: "add" })),
  updateWatchlistItem: vi.fn((_req, res) => res.status(200).json({ ok: "update" })),
  removeFromWatchlist: vi.fn((_req, res) => res.status(200).json({ ok: "remove" })),
  getWatchlist: vi.fn((_req, res) => res.status(200).json({ ok: "get" })),
}));
vi.mock("../../src/validators/watchlistValidators.js", () => ({
  addToWatchlistSchema: {},
}));

import watchlistRoute from "../../src/routes/watchlistRoute.js";
import * as watchlistController from "../../src/controllers/watchlistController.js";

describe("watchlist routes", () => {
  const findRouteLayer = (path, method) =>
    watchlistRoute.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method]
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET / is wired", () => {
    const layer = findRouteLayer("/", "get");
    expect(layer).toBeTruthy();
    expect(layer.route.stack).toHaveLength(1);
    expect(layer.route.stack[0].handle).toBe(watchlistController.getWatchlist);
  });

  it("POST / is wired with validation middleware", () => {
    const layer = findRouteLayer("/", "post");
    expect(layer).toBeTruthy();
    expect(layer.route.stack).toHaveLength(2);
    expect(typeof layer.route.stack[0].handle).toBe("function");
    expect(layer.route.stack[1].handle).toBe(watchlistController.addToWatchlist);

    const req = {};
    const res = createMockRes();
    layer.route.stack[1].handle(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
