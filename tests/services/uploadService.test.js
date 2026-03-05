import { describe, it, expect } from "vitest";
import { buildImageUploadResponse } from "../../src/services/uploadService.js";

describe("uploadService", () => {
  it("builds image URL when filename exists", () => {
    const result = buildImageUploadResponse({
      protocol: "http",
      host: "localhost:5001",
      filename: "abc.jpg",
    });

    expect(result).toEqual({
      message: "Image uploaded successfully",
      imagePath: "http://localhost:5001/uploads/images/abc.jpg",
    });
  });

  it("throws 400 when filename is missing", () => {
    expect(() =>
      buildImageUploadResponse({
        protocol: "http",
        host: "localhost:5001",
      })
    ).toThrow("Image file is required. Use form-data key: image");
  });
});
