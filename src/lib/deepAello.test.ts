// Regression tests for the Deep Aello restore trap: a backup that carried
// deep_flow_active=true without its (internal, never-exported) activation timestamp used to
// read as "active forever", permanently muting watch-history recording and AelloNeuro
// learning. A zero/missing activatedAt must now report NOT active and self-heal the flag.

import { beforeEach, describe, expect, it, vi } from "vitest";

const { settingValues, setSettingValueMock } = vi.hoisted(() => {
  const settingValues = new Map<string, string>();
  const setSettingValueMock = vi.fn(async (key: string, value: string) => {
    settingValues.set(key, value);
    return true;
  });
  return { settingValues, setSettingValueMock };
});

vi.mock("../store/useAppSettingsStore", () => ({
  getSettingValue: (key: string) => settingValues.get(key) ?? "",
  setSettingValue: setSettingValueMock,
}));

vi.mock("../store/useUiStore", () => ({
  useUiStore: { getState: () => ({ showToast: vi.fn() }) },
}));

import {
  DEEP_AELLO_NEVER_EXPIRES_HOURS,
  getDeepAelloRemainingMs,
  isDeepAelloCurrentlyActive,
  shouldRecordWatchHistory,
} from "./deepAello";
import { SETTINGS } from "./settings/schema";

const seed = (values: Partial<Record<string, string>>) => {
  settingValues.clear();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) settingValues.set(key, value);
  }
};

beforeEach(() => {
  settingValues.clear();
  setSettingValueMock.mockClear();
});

describe("getDeepAelloRemainingMs", () => {
  it("returns null when inactive", () => {
    expect(getDeepAelloRemainingMs(false, Date.now(), 4)).toBeNull();
  });

  it("returns the remaining time for an active session with a valid timestamp", () => {
    const remaining = getDeepAelloRemainingMs(true, Date.now() - 3_600_000, 4);
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeGreaterThan(2 * 3_600_000);
    expect(remaining!).toBeLessThanOrEqual(3 * 3_600_000);
  });

  it("returns a non-positive remainder once the timer has elapsed", () => {
    const remaining = getDeepAelloRemainingMs(true, Date.now() - 5 * 3_600_000, 4);
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeLessThanOrEqual(0);
  });

  it("keeps 'never expires' semantics for a VALID activation timestamp", () => {
    expect(
      getDeepAelloRemainingMs(true, Date.now(), DEEP_AELLO_NEVER_EXPIRES_HOURS),
    ).toBeNull();
  });

  it("treats active with activatedAt=0 as already expired, not eternal", () => {
    expect(getDeepAelloRemainingMs(true, 0, 4)).toBe(0);
  });

  it("kills the zero-activatedAt trap even under 'never expires'", () => {
    expect(getDeepAelloRemainingMs(true, 0, DEEP_AELLO_NEVER_EXPIRES_HOURS)).toBe(0);
  });

  it("treats an unparseable activatedAt as expired", () => {
    expect(getDeepAelloRemainingMs(true, Number.NaN, 4)).toBe(0);
  });
});

describe("isDeepAelloCurrentlyActive", () => {
  it("is active with a valid timestamp inside the window", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: String(Date.now()),
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
    });
    expect(isDeepAelloCurrentlyActive()).toBe(true);
  });

  it("stays active forever for a valid timestamp with expireHours=0", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: String(Date.now() - 100 * 3_600_000),
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "0",
    });
    expect(isDeepAelloCurrentlyActive()).toBe(true);
  });

  it("is NOT active when active=true but activatedAt is 0 (restored backup)", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: "0",
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
    });
    expect(isDeepAelloCurrentlyActive()).toBe(false);
  });

  it("self-heals the corrupt flag by clearing deep_flow_active", async () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: "0",
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
    });
    isDeepAelloCurrentlyActive();
    expect(setSettingValueMock).toHaveBeenCalledWith(SETTINGS.DEEP_AELLO_ACTIVE, "false");
    await Promise.resolve(); // let the fire-and-forget write settle
    expect(settingValues.get(SETTINGS.DEEP_AELLO_ACTIVE)).toBe("false");
    expect(isDeepAelloCurrentlyActive()).toBe(false);
  });

  it("is not active once the timer has expired", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: String(Date.now() - 5 * 3_600_000),
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
    });
    expect(isDeepAelloCurrentlyActive()).toBe(false);
  });
});

describe("shouldRecordWatchHistory", () => {
  it("keeps recording history in the corrupt restored state", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: "0",
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
      [SETTINGS.DEEP_AELLO_SAVE_HISTORY]: "false",
    });
    expect(shouldRecordWatchHistory()).toBe(true);
  });

  it("suppresses history during a genuine Deep Aello session", () => {
    seed({
      [SETTINGS.DEEP_AELLO_ACTIVE]: "true",
      [SETTINGS.DEEP_AELLO_ACTIVATED_AT]: String(Date.now()),
      [SETTINGS.DEEP_AELLO_EXPIRE_HOURS]: "4",
      [SETTINGS.DEEP_AELLO_SAVE_HISTORY]: "false",
    });
    expect(shouldRecordWatchHistory()).toBe(false);
  });
});
