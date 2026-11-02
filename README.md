<div align="center">
  <img src="public/logo.png" alt="Aello logo" width="120">

  **A privacy-respecting YouTube and YouTube Music client with a native, fully local recommendation engine.**

  Aello Desktop is the desktop companion to [Aello for Android](https://github.com/Niczzxo/Aello-Native), built with Rust, Tauri, React, and TypeScript.

  <p>
  <a href="https://github.com/Niczzxo/Aello-Desktop/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/pill/get-windows-dark.svg"><img alt="Download for Windows" src="https://assets.flow-tube.org/v1/badges/pill/get-windows-light.svg" height="60"></picture></a>
  <a href="https://github.com/Niczzxo/Aello-Desktop/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/pill/get-macos-dark.svg"><img alt="Download for macOS" src="https://assets.flow-tube.org/v1/badges/pill/get-macos-light.svg" height="60"></picture></a>
  <a href="https://github.com/Niczzxo/Aello-Desktop/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/pill/get-linux-dark.svg"><img alt="Download for Linux" src="https://assets.flow-tube.org/v1/badges/pill/get-linux-light.svg" height="60"></picture></a>
  </p>
  <p>
  <a href="#downloads-and-supported-systems"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/split/desktop-dark.svg"><img alt="Desktop: Windows · macOS · Linux" src="https://assets.flow-tube.org/v1/badges/split/desktop-light.svg" height="32"></picture></a>
  <picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/split/tauri-dark.svg"><img alt="Built with Rust · Tauri 2" src="https://assets.flow-tube.org/v1/badges/split/tauri-light.svg" height="32"></picture>
  <a href="LICENSE"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/split/license-dark.svg"><img alt="License: GPL-3.0" src="https://assets.flow-tube.org/v1/badges/split/license-light.svg" height="32"></picture></a>
  </p>

  [**Downloads**](https://github.com/Niczzxo/Aello-Desktop/releases/latest) · [**Android app**](https://github.com/Niczzxo/Aello-Native)
</div>

> Aello Desktop is under active development. Features and storage formats may change before the first stable release.

---

## Features

- Native video playback with quality and codec selection, SABR/DASH/HLS support, chapters, subtitles, playback speed, queues, mini-player, and Picture-in-Picture.
- YouTube Music home, search, artists, albums, playlists, queue management, synchronized lyrics, repeat, shuffle, and equalizer controls.
- A dedicated Shorts feed with comments, descriptions, saved Shorts, looping, auto-next, and timed scrolling modes.
- Local subscriptions, playlists, Watch Later, likes, albums, video and music history, Continue Watching, and regional Explore feeds.
- Channel pages with videos, Shorts, playlists, community posts, comments, and live chat support.
- SponsorBlock, DeArrow, Return YouTube Dislike, and Discord Rich Presence integrations.
- Imports from Aello backups, Google Takeout, NewPipe, LibreTube, FreeTube, and OPML.

### AelloNeuro

AelloNeuro is Aello's native local recommendation engine. It learns from watches, skips, likes, dislikes, searches, topic preferences, and creator affinity, and ranks content on your device without sending a recommendation profile to a Aello server.

The Control Center lets you inspect topic weights, time-based patterns, channel memory, learning activity, and blocked content. You can export, import, reset, or temporarily pause learning with Deep Aello mode.

---

## Privacy and security

- No Google account is required, and Aello contains no advertising or analytics SDK.
- History, settings, library data, and recommendation state are stored locally in SQLite.
- Tauri permissions are restricted to the main window and the OS, dialog, and external-link capabilities the app uses.
- A strict Content Security Policy blocks arbitrary scripts, frames, objects, and remote application code.
- Rust validates search terms, video IDs, channel IDs, browse IDs, and continuation tokens before network requests.
- Media is relayed through a tokenized loopback-only proxy instead of exposing a public local server.
- BotGuard and PO-token handling run through a native hidden WebView, with a packaged Node script retained only as a compatibility fallback.

Aello still contacts YouTube and optional services such as SponsorBlock, DeArrow, Return YouTube Dislike, and configured lyrics providers when their features are used.

---

## Downloads and supported systems

Release builds are published through [GitHub Releases](https://github.com/Niczzxo/Aello-Desktop/releases/latest).

- **Stable:** reviewed releases intended for normal use.
- **Beta / RC:** public GitHub prereleases for wider testing. These install as **Aello Beta** with isolated application data.
- **Nightly:** automatic snapshots from `main`. These install as **Aello Nightly**, use isolated data, and may be unstable. Download the latest packages from [GitHub Actions](https://github.com/Niczzxo/Aello-Desktop/actions/workflows/build.yml) or [nightly.link](https://nightly.link/Niczzxo/Aello-Desktop/workflows/build/main) without a GitHub account.

| Platform | Supported versions | Architectures | Packages |
| --- | --- | --- | --- |
| Windows | Windows 10 22H2, Windows 11 | x64, ARM64 | NSIS installer |
| macOS | macOS 13 Ventura or later | Intel x64, Apple Silicon | DMG |
| Linux | Ubuntu 22.04+, Debian 12+, and comparable modern distributions | x64, ARM64 | AppImage, `.deb`, `.rpm` |

Linux builds require a compatible glibc, GTK 3, and WebKitGTK 4.1 environment. Legacy 32-bit systems are not supported.

### Linux media codecs

On Linux, video decoding goes through WebKitGTK and the system GStreamer plugins (Windows and macOS ship their own decoders). If audio plays but video stays frozen on a spinner, a video decoder is missing.

- **AppImage** — bundles the required GStreamer codec plugins (including `gst-libav` for H.264); no system codec packages are needed.
- **`.deb`** — declares the codec plugins as dependencies. Install with `sudo apt install ./Aello_*.deb` so they are pulled in automatically.
- **`.rpm`** — the freely licensed plugins are hard dependencies. On Fedora, H.264 decoding (`gstreamer1-libav`, `gstreamer1-plugins-bad-freeworld`) is only available from [RPM Fusion](https://rpmfusion.org/Configuration) for patent reasons: enable RPM Fusion and run `sudo dnf install gstreamer1-libav gstreamer1-plugins-bad-freeworld`, or use the AppImage instead.

### Linux startup crashes and blank windows

If the app opens to a blank or white window, that is usually the WebKitGTK DMABUF renderer failing on your graphics stack (common with NVIDIA proprietary drivers and some Wayland sessions). Aello disables it automatically and, if a launch still fails to render, **escalates GPU workarounds on the next launch on its own**: first forcing software compositing (`WEBKIT_DISABLE_COMPOSITING_MODE=1`), then falling back to X11/XWayland (`GDK_BACKEND=x11`). A clean launch resets this. You can still override any of these yourself — for example `WEBKIT_DISABLE_DMABUF_RENDERER=0` to re-enable the DMABUF renderer.

If the app aborts on startup with `Could not create default EGL display: EGL_BAD_PARAMETER` (seen on some Arch-family / Mesa systems with the **AppImage**), that is a known Tauri AppImage packaging issue: a bundled `libwayland` client library conflicts with your system's newer Mesa/EGL stack. As an interim workaround, delete the bundled Wayland libraries and run the extracted app:

```sh
./Aello_*_linux_amd64.AppImage --appimage-extract
rm squashfs-root/usr/lib/*wayland*so*
./squashfs-root/AppRun
```

On Arch-family distributions the AUR package and the planned Flatpak build avoid this class of issue; prefer those when available.

---

## Development

Requirements: Node.js 22.12+, pnpm 11.9+, stable Rust, and the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system.

```sh
pnpm install --frozen-lockfile
pnpm tauri dev
```

Build packages for the current operating system:

```sh
pnpm test
pnpm build
pnpm tauri build
```

Windows, Linux, and macOS packages are built natively by the GitHub Actions release workflow. Production macOS and Windows releases should be signed and, on macOS, notarized before publication.

---

## License

Aello Desktop is free software licensed under the [GNU General Public License v3.0](LICENSE).

This license requires that any project using Aello's source code, including the AelloNeuro engine, must also be released as open source under GPLv3. It may not be used in a proprietary or closed-source application.

Copyright © 2025–2026 Niczzxo

---

## Star History

<a href="https://github.com/Niczzxo/Aello-Desktop/stargazers">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/stars/stars-flow-desktop-dark.svg">
    <img alt="Star history of Aello Desktop" src="https://assets.flow-tube.org/v1/stars/stars-flow-desktop-light.svg" width="100%">
  </picture>
</a>

---

<div align="center">
  <a href="https://github.com/Niczzxo"><picture><source media="(prefers-color-scheme: dark)" srcset="https://assets.flow-tube.org/v1/badges/pill/part-of-flow-dark.svg"><img alt="Part of the Aello ecosystem" src="https://assets.flow-tube.org/v1/badges/pill/part-of-flow-light.svg" height="60"></picture></a>
</div>
