import { useEffect } from "react";
import { getDeepAelloRemainingMs, setDeepAelloEnabled } from "../../lib/deepAello";
import { SETTINGS } from "../../lib/settings/schema";
import { useAppSettingsStore } from "../../store/useAppSettingsStore";

export function DeepAelloController() {
  const active = useAppSettingsStore((state) => state.values[SETTINGS.DEEP_AELLO_ACTIVE] === "true");
  const activatedAt = useAppSettingsStore((state) => Number(state.values[SETTINGS.DEEP_AELLO_ACTIVATED_AT] ?? "0"));
  const expireHours = useAppSettingsStore((state) => Number(state.values[SETTINGS.DEEP_AELLO_EXPIRE_HOURS] ?? "4"));

  useEffect(() => {
    const remainingMs = getDeepAelloRemainingMs(active, activatedAt, expireHours);
    if (!active || remainingMs === null) return;

    if (remainingMs <= 0) {
      void setDeepAelloEnabled(false, "timer");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void setDeepAelloEnabled(false, "timer");
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [active, activatedAt, expireHours]);

  return null;
}
