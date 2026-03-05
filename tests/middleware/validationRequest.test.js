import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validateRequest } from "../../src/middleware/validationRequest.js";
import { createMockRes } from "../helpers/httpMocks.js";

describe("validationRequest middleware", () => {
  const schema = z.object({
    title: z.string().min(1),
  });

  it("calls next when body is valid", () => {
    const req = { body: { title: "ok" } };
    const res = createMockRes();
    const next = vi.fn();

    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 400 when body is invalid", () => {
    const req = { body: { title: "" } };
    const res = createMockRes();
    const next = vi.fn();

    validateRequest(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });
});
