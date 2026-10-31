import { getString } from "./i18n/index";
import { SETTINGS } from "./settings/schema";
import { getSettingValue, setSettingValue } from "../store/useAppSettingsStore";
import { useUiStore } from "../store/useUiStore";

export const DEEP_AELLO_NEVER_EXPIRES_HOURS = 0;

export type DeepAelloDisableReason = "manual" | "timer";

export const DEEP_AELLO_DURATION_OPTIONS = [
  DEEP_AELLO_NEVER_EXPIRES_HOURS,
  1,
  2,
  4,
  6,
  8,
  12,
  24,
] as const;

export function getDeepAelloDurationLabel(hours: number): string {
  switch (hours) {
    case DEEP_AELLO_NEVER_EXPIRES_HOURS:
      return getString("deep_aello_duration_never");
    case 1:
      return getString("deep_aello_duration_1h");
    case 2:
      return getString("deep_aello_duration_2h");
    case 4:
      return getString("deep_aello_duration_4h");
    case 6:
      return getString("deep_aello_duration_6h");
    case 8:
      return getString("deep_aello_duration_8h");
    case 12:
      return getString("deep_aello_duration_12h");
    case 24:
      return getString("deep_aello_duration_24h");
    default:
      return getString("deep_aello_duration_hours", hours);
  }
}

export function getDeepAelloRemainingMs(
  active = getSettingValue(SETTINGS.DEEP_AELLO_ACTIVE) === "true",
  activatedAt = Number(getSettingValue(SETTINGS.DEEP_AELLO_ACTIVATED_AT)),
  expireHours = Number(getSettingValue(SETTINGS.DEEP_AELLO_EXPIRE_HOURS)),
): number | null {
  if (!active) return null;
  if (!activatedAt) return 0;
  if (expireHours === DEEP_AELLO_NEVER_EXPIRES_HOURS) return null;
  return activatedAt + expireHours * 3_600_000 - Date.now();
}

let healingCorruptState = false;

export function isDeepAelloCurrentlyActive(): boolean {
  const active = getSettingValue(SETTINGS.DEEP_AELLO_ACTIVE) === "true";
  if (!active) return false;

  const activatedAt = Number(getSettingValue(SETTINGS.DEEP_AELLO_ACTIVATED_AT));
  if (!activatedAt) {
    if (!healingCorruptState) {
      healingCorruptState = true;
      void setSettingValue(SETTINGS.DEEP_AELLO_ACTIVE, "false").finally(() => {
        healingCorruptState = false;
      });
    }
    return false;
  }

  const remainingMs = getDeepAelloRemainingMs(active, activatedAt);
  return remainingMs === null || remainingMs > 0;
}

export function shouldSaveHistoryInDeepAello(): boolean {
  return getSettingValue(SETTINGS.DEEP_AELLO_SAVE_HISTORY) === "true";
}

export function shouldRecordWatchHistory(): boolean {
  return !isDeepAelloCurrentlyActive() || shouldSaveHistoryInDeepAello();
}

function showDeepAelloToast(active: boolean, reason: DeepAelloDisableReason) {
  const message = active
    ? getString("deep_aello_enabled_message")
    : reason === "timer"
      ? getString("deep_aello_expired_message")
      : getString("deep_aello_disabled_message");

  useUiStore.getState().showToast({
    message,
    variant: active ? "success" : "info",
  });
}

export async function setDeepAelloEnabled(
  enabled: boolean,
  reason: DeepAelloDisableReason = "manual",
): Promise<boolean> {
  const rawEnabled = getSettingValue(SETTINGS.DEEP_AELLO_ACTIVE) === "true";
  const effectivelyEnabled = isDeepAelloCurrentlyActive();
  if (rawEnabled === enabled && effectivelyEnabled === enabled) return enabled;

  if (enabled) {
    const timestampSaved = await setSettingValue(SETTINGS.DEEP_AELLO_ACTIVATED_AT, String(Date.now()));
    if (!timestampSaved) return false;
    const activeSaved = await setSettingValue(SETTINGS.DEEP_AELLO_ACTIVE, "true");
    if (!activeSaved) return false;
  } else {
    const activeSaved = await setSettingValue(SETTINGS.DEEP_AELLO_ACTIVE, "false");
    if (!activeSaved) return false;
    await setSettingValue(SETTINGS.DEEP_AELLO_ACTIVATED_AT, "0");
  }

  showDeepAelloToast(enabled, reason);
  return enabled;
}

export async function toggleDeepAello(): Promise<boolean> {
  return setDeepAelloEnabled(!isDeepAelloCurrentlyActive());
}
