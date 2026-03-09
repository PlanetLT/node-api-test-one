import { vi } from "vitest";
import i18next from "../../src/i18n.js";

const createMockRes = () => {
  const res = {};
  res.req = { t: i18next.t.bind(i18next) };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

export { createMockRes };
