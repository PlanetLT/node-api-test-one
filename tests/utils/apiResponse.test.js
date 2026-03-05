import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../../src/utils/apiResponse.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("apiResponse utils", () => {
  it("sendSuccess returns standardized success payload", () => {
    const res = createRes();

    sendSuccess(res, {
      statusCode: 201,
      message: "Created",
      data: { id: "1" },
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: { id: "1" },
    });
  });

  it("sendError returns standardized error payload", () => {
    const res = createRes();

    sendError(res, {
      statusCode: 400,
      message: "Bad request",
      errors: ["invalid"],
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad request",
      errors: ["invalid"],
    });
  });
});
