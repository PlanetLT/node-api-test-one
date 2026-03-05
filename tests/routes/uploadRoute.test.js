import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/middleware/authMiddleware.js", () => ({
  authMiddleware: vi.fn((_req, _res, next) => next()),
}));
vi.mock("../../src/middleware/uploadMiddleware.js", () => ({
  uploadImage: vi.fn((_req, _res, next) => next()),
}));
vi.mock("../../src/controllers/uploadController.js", () => ({
  uploadImageFile: vi.fn((_req, res) => res.status(201).json({ ok: "upload" })),
}));

import uploadRoute from "../../src/routes/uploadRoute.js";
import * as authModule from "../../src/middleware/authMiddleware.js";
import * as uploadModule from "../../src/middleware/uploadMiddleware.js";
import * as uploadController from "../../src/controllers/uploadController.js";

describe("upload routes", () => {
  const findRouteLayer = (path, method) =>
    uploadRoute.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method]
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /image is wired with auth and upload middleware", () => {
    const layer = findRouteLayer("/image", "post");
    expect(layer).toBeTruthy();
    expect(layer.route.stack).toHaveLength(3);
    expect(layer.route.stack[0].handle).toBe(authModule.authMiddleware);
    expect(layer.route.stack[1].handle).toBe(uploadModule.uploadImage);
    expect(layer.route.stack[2].handle).toBe(uploadController.uploadImageFile);

    const req = {};
    const res = createMockRes();
    layer.route.stack[2].handle(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
