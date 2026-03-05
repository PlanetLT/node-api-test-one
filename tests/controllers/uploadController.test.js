import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/services/uploadService.js", () => ({
  buildImageUploadResponse: vi.fn(),
}));

import { buildImageUploadResponse } from "../../src/services/uploadService.js";
import { uploadImageFile } from "../../src/controllers/uploadController.js";

describe("uploadController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with uploaded image data", async () => {
    buildImageUploadResponse.mockReturnValue({
      message: "Image uploaded successfully",
      imagePath: "http://localhost:5001/uploads/images/a.jpg",
    });
    const req = {
      protocol: "http",
      get: vi.fn().mockReturnValue("localhost:5001"),
      file: { filename: "a.jpg" },
    };
    const res = createMockRes();

    await uploadImageFile(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns service error on invalid payload", async () => {
    const err = new Error("Image file is required. Use form-data key: image");
    err.status = 400;
    buildImageUploadResponse.mockImplementation(() => {
      throw err;
    });
    const req = {
      protocol: "http",
      get: vi.fn().mockReturnValue("localhost:5001"),
      file: null,
    };
    const res = createMockRes();

    await uploadImageFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Image file is required. Use form-data key: image",
      })
    );
  });
});
