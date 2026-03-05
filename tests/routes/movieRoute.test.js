import { describe, it, expect } from "vitest";
import movieRoute from "../../src/routes/movieRoute.js";
import { createMockRes } from "../helpers/httpMocks.js";

describe("movie routes", () => {
  const findRouteLayer = (path, method) =>
    movieRoute.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method]
    );

  it("has GET / route and returns standardized payload", () => {
    const layer = findRouteLayer("/", "get");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { httpMethod: "GET" },
      })
    );
  });

  it("has POST / route and returns standardized payload", () => {
    const layer = findRouteLayer("/", "post");
    expect(layer).toBeTruthy();

    const req = {};
    const res = createMockRes();
    layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { httpMethod: "POST" },
      })
    );
  });
});
