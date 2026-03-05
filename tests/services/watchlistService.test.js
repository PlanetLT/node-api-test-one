import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/db.js", () => ({
  prisma: {
    movie: {
      findUnique: vi.fn(),
    },
    watchlistItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/config/db.js";
import {
  addItem,
  updateItem,
  removeItem,
  getItems,
} from "../../src/services/watchlistService.js";

describe("watchlistService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addItem throws when movie does not exist", async () => {
    prisma.movie.findUnique.mockResolvedValue(null);

    await expect(addItem("u1", { movieId: "m1" })).rejects.toMatchObject({
      status: 404,
      message: "Movie not found",
    });
  });

  it("addItem creates a watchlist item", async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: "m1" });
    prisma.watchlistItem.findUnique.mockResolvedValue(null);
    prisma.watchlistItem.create.mockResolvedValue({ id: "w1" });

    const result = await addItem("u1", {
      movieId: "m1",
      status: "PLANNED",
    });

    expect(result).toEqual({ id: "w1" });
  });

  it("updateItem throws when not owner", async () => {
    prisma.watchlistItem.findUnique.mockResolvedValue({ id: "w1", userId: "u2" });

    await expect(updateItem("u1", "w1", { notes: "x" })).rejects.toMatchObject({
      status: 403,
      message: "Not allowed to update this watchlist item",
    });
  });

  it("removeItem deletes when owner", async () => {
    prisma.watchlistItem.findUnique.mockResolvedValue({ id: "w1", userId: "u1" });
    prisma.watchlistItem.delete.mockResolvedValue({});

    await removeItem("u1", "w1");

    expect(prisma.watchlistItem.delete).toHaveBeenCalledWith({
      where: { id: "w1" },
    });
  });

  it("getItems returns paginated payload", async () => {
    prisma.watchlistItem.count.mockResolvedValue(1);
    prisma.watchlistItem.findMany.mockResolvedValue([
      { id: "w1", movie: { id: "m1" } },
    ]);

    const result = await getItems("u1", { page: 1, limit: 10 });

    expect(result.watchlist).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });
});
