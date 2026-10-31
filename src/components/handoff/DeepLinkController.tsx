import { useDeepLinkHandoff } from "../../lib/useDeepLinkHandoff";

/**
 * Bridges the Aello browser extension to the app: routes `aello://` deep links and
 * loopback-bridge handoffs into playback or the download dialog. Renders nothing.
 */
export function DeepLinkController() {
  useDeepLinkHandoff();
  return null;
}
