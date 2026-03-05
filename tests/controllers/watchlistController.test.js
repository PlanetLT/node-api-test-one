import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRes } from "../helpers/httpMocks.js";

vi.mock("../../src/services/watchlistService.js", () => ({
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  getItems: vi.fn(),
}));

import {
  addItem,
  updateItem,
  removeItem,
  getItems,
} from "../../src/services/watchlistService.js";
import {
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  getWatchlist,
} from "../../src/controllers/watchlistController.js";

describe("watchlistController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addToWatchlist returns 201", async () => {
    addItem.mockResolvedValue({ id: "w1" });
    const req = {
      user: { id: "u1" },
      body: { movieId: "m1", status: "PLANNED" },
    };
    const res = createMockRes();

    await addToWatchlist(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(addItem).toHaveBeenCalledWith("u1", req.body);
  });

  it("updateWatchlistItem returns 200", async () => {
    updateItem.mockResolvedValue({ id: "w1" });
    const req = { user: { id: "u1" }, params: { id: "w1" }, body: {} };
    const res = createMockRes();

    await updateWatchlistItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("removeFromWatchlist returns 200", async () => {
    removeItem.mockResolvedValue(undefined);
    const req = { user: { id: "u1" }, params: { id: "w1" } };
    const res = createMockRes();

    await removeFromWatchlist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getWatchlist returns paginated data", async () => {
    getItems.mockResolvedValue({
      watchlist: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
    const req = { user: { id: "u1" }, query: {} };
    const res = createMockRes();

    await getWatchlist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(getItems).toHaveBeenCalledWith("u1", { page: 1, limit: 10 });
  });
});
