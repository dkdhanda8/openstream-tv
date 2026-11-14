# Documentation audit — OpenStream TV 1.6.0

Internal record of the documentation review completed on 2026-11-14 from
commit `369b67e` (`Cargo.toml` version `1.6.0`). It is not part of the published
help centre: `docs/` remains the authored source of truth, and this file records
coverage, evidence and limits.

## Target

- **Stable target:** the `1.6.0` source in this checkout and the stable release
  it produces (JioTV, JioTV+, Fastway).
- **Beta target:** the `v1.6.0-beta.*` prerelease line, built with
  `--features beta` (adds Airtel Xstream, PlayboxTV, Tata Play, VZY). Beta
  behaviour is described as prerelease-only everywhere, and
  `docs/installations-beta/` is the install path.
- **Not described as generally available:** beta providers, beta Docker images
  (none are published), and catch-up browsing (server routes exist, no web UI).

## Article counts

| Section | Before | After |
| --- | ---: | ---: |
| Getting Started (including the help-centre home) | 9 | 9 |
| Installation | 12 | 13 |
| Account Setup | 6 | 6 |
| Beta Provider Reference | 4 | 4 |
| Using OpenStream TV | 7 | 7 |
| Configuration | 6 | 6 |
| Troubleshooting | 15 | 15 |
| Maintenance | 8 | 8 |
| **Total article pages** | **68** | **69** |

Added: `docs/installations-beta/index.md`. Merged or removed: none.
`docs/README.md` and `docs/SUMMARY.md` remain the only non-article Markdown
files; all 69 pages appear once in `SUMMARY.md`.

## Review matrix

Status meanings: **verified** (read and checked against the implementation, no
change needed), **corrected** (edited and rechecked), **partial** (independent
parts verified; a runtime or device-dependent claim could not be reproduced).

### Getting Started

| Article | Finding and change | Status |
| --- | --- | --- |
| `getting-started/index.md` | Landing list matches the eight articles and the new install path stays in Installation. | verified |
| `getting-started-in-5-minutes/index.md` | "Navigation" and "top bar" replaced with sidebar/tab bar; Channels screenshot refreshed; beta build prerequisite added; v1.5.0 caption corrected. | corrected |
| `getting-started-what-is-openstream-tv/index.md` | Main-screen description updated from Channels/On demand/Settings to the five current destinations; slim and JioTV+ wording matches `Cargo.toml`. | corrected |
| `getting-started-requirements/index.md` | Beta providers now explicitly prerelease-only, with the beta install link. | corrected |
| `getting-started-jiotv-and-extras/index.md` | Settings screenshot and caption replaced; beta paragraph links to the beta install guide. | corrected |
| `getting-started-installation-overview/index.md` | Installer account list matches the scripts' conditional provider menu; version behaviour cross-checked. | verified |
| `getting-started-first-launch/index.md` | Post-setup destinations corrected to the sidebar items; setup screenshot recaptured on 1.6.0; sign-in screenshot added. | corrected |
| `getting-started-navigate-interface/index.md` | Rewritten for the sidebar, phone tab bar, collapse control, provider pill and Live TV home; stale top-bar claims removed. | corrected |
| `getting-started-watch-first-channel/index.md` | Sidebar navigation; channel and player images replaced; evidence limits restated. | corrected |
| `help-centre/index.md` | Removed the unsupported catch-up promise; provider table marks beta as prerelease-only; beta install row added. | corrected |

### Installation

| Article | Finding and change | Status |
| --- | --- | --- |
| `installations/index.md` | Beta prerelease row and a stable-vs-prerelease note added. | corrected |
| `installations-linux/index.md` | Pinned example moved to 1.6.0; beta build note added. Installer flags cross-checked against `scripts/install.sh`. | corrected |
| `installations-macos/index.md` | Beta pin documented; existing guided-setup description matches the installer's `/dev/tty` prompts. | corrected |
| `installations-windows/index.md` | Provider table completed for PlayboxTV, Tata Play and VZY; "Airtel only" limitation removed; version example updated; beta pin documented. | corrected |
| `installations-openwrt/index.md` | Version example updated and prerelease pin documented; package/arch table matches the installer patterns. | corrected |
| `installations-android-app/index.md` | APK remains described as a workflow artifact, not a release APK; provider/TV layout claims match `android/README.md`. Not run on a device. | partial |
| `installations-sbc/index.md` | Architecture table and playlist verification match release targets and keyed routes. | verified |
| `installations-termux/index.md` | Version example updated; incorrect "Airtel only" beta list replaced with the release-dependent set. | corrected |
| `installations-docker/index.md` | Tag example updated; prerelease Docker images explicitly documented as unpublished (`docker.yml` runs on stable tags only). | corrected |
| `installations-docker-compose/index.md` | Commands, volume and password flow match `docker/Dockerfile` and the CLI. | verified |
| `installations-manual-binary/index.md` | Prerelease asset location documented; asset names match `release.yml`. | corrected |
| `installations-beta/index.md` | **New.** Prerelease installation for Linux/macOS/Termux, Windows, OpenWrt, manual binaries and source; Docker limitation; enablement, verification and return to stable. Commands checked against `install.sh`, `install.ps1`, `release.yml`, `update.rs`. | corrected |
| `installations-build-from-source/index.md` | `--features beta` build documented and linked. | corrected |

### Account Setup

| Article | Finding and change | Status |
| --- | --- | --- |
| `account/index.md` | Admin session vs provider account and EPG limits match the UI and provider modules. | verified |
| `account-connect-jiotv/index.md` | Screenshot replaced; labels match `JioTVLogin.svelte` (**Send OTP**, **Log in**); active-provider side effect stated. | corrected |
| `account-switch-jiotv/index.md` | Screenshot and caption replaced; CLI reset/login sequence matches `cli.rs`. | corrected |
| `account-extras/index.md` | Screenshot replaced; "header indicator" replaced with the current pill/dot; unlock flow matches `Channels.svelte` and `unlock.rs`. | corrected |
| `account-fastway/index.md` | Version-specific security heading and text de-versioned; provider indicator corrected. Login/logout behaviour matches `fastway_state.rs`. | corrected |
| `account-sessions/index.md` | Sign-out paths corrected to the sidebar icon and **Settings → Security → This browser**; session rules match `api.rs`. | corrected |

### Beta Provider Reference

| Article | Finding and change | Status |
| --- | --- | --- |
| `ott-provider-airtel/index.md` | Prerelease-only note added; contracts unchanged and consistent with `src/airtel.rs`. Live account not tested. | partial |
| `ott-provider-playbox/index.md` | Prerelease-only note added; evidence limits (no live calls) were already stated. | partial |
| `ott-provider-tataplay/index.md` | Prerelease-only note added; route list matches `src/server.rs`. | partial |
| `ott-provider-vzy/index.md` | Prerelease-only note added; free-tier facts independently confirmed during screenshot capture (29 free channels, live HLS playback). | partial |

### Using OpenStream TV

| Article | Finding and change | Status |
| --- | --- | --- |
| `using/index.md` | Article list matches the section. | verified |
| `using-live-tv/index.md` | Rewritten: Live TV home, current filter labels, real player controls (quality, picture-in-picture, restart, fullscreen), guide panel. | corrected |
| `using-programme-guide/index.md` | Previously described only the player sidebar; now documents the dedicated **Guide** page with its language chips, paging and programme rows, plus the player panel. | corrected |
| `using-on-demand/index.md` | Stale screenshot removed; sidebar navigation, JioTV+ prerequisite and the 503 message documented; sections match `OnDemand.svelte`. | corrected |
| `using-iptv-playlists/index.md` | URLs, key rotation and LAN printing match `server.rs`/`main.rs`. | verified |
| `using-vlc/index.md` | Menu paths and DRM limits are accurate; no change. | verified |
| `using-settings/index.md` | Rewritten for the three groups (**Provider login**, **IPTV playlist & EPG**, **Security**), current labels and phone sign-out; screenshot replaced. | corrected |

### Configuration

| Article | Finding and change | Status |
| --- | --- | --- |
| `configuration/index.md` | Landing list matches the five articles. | verified |
| `configuration-reference/index.md` | Keys, defaults and precedence cross-checked against `config.rs`; beta sentence links to the install guide. | verified |
| `configuration-cli/index.md` | Every command, alias and flag checked against `cli.rs` and `help_text()`. | verified |
| `configuration-network-security/index.md` | Two v1.5.0-only statements de-versioned; LAN printing, TLS and public-origin behaviour match `main.rs`/`public_origin.rs`. | corrected |
| `configuration-storage-logs/index.md` | Store files, PID and TLS paths match `store.rs`; `log_path` is correctly described as unimplemented. | verified |
| `configuration-iptv-epg-streaming/index.md` | Removed an image that no longer showed the URL fields; text now points to the exact Settings group. EPG override behaviour matches `main.rs`. | corrected |

### Troubleshooting

| Article | Finding and change | Status |
| --- | --- | --- |
| `troubleshooting/index.md` | Entry points and safe-first-checks match the current UI. | verified |
| `fix-video-stuck-loading/index.md` | Symptom text matches the player's **Playback unavailable** state; no stale navigation. | verified |
| `fix-drm-playback-errors/index.md` | HTTPS/Widevine checks match `shakaPlayer.js` and the TLS flags. | verified |
| `fix-otp-login/index.md` | Replaced the non-existent **Not logged in** label with the actual form state and **Active** pill. | corrected |
| `fix-extras-connection/index.md` | Filters, **Show unavailable** and active-provider checks match the current Channels page. | verified |
| `fix-epg-not-updating/index.md` | EPG defaults/override and the Settings group are correct. | verified |
| `fix-web-interface-not-opening/index.md` | Ports, bind behaviour and HTTPS checks match `cli.rs`. | verified |
| `troubleshooting-accounts-and-extras/index.md` | Removed the non-existent **Unlock/Lock** Settings buttons; unlock is via the Channels search box (`unlock.rs`). | corrected |
| `troubleshooting-fastway/index.md` | De-versioned the HTTP transport limitation; DASH/PallyCon checks match `fastway.rs`. | corrected |
| `troubleshooting-channels-and-playback/index.md` | Provider list, subscription markers and player errors match the current UI. | verified |
| `troubleshooting-protected-playback/index.md` | Secure-context, EME and license guidance matches `Watch.svelte`/`shakaPlayer.js`. | verified |
| `troubleshooting-epg-and-playlists/index.md` | Playlist/EPG matching and provider-switch behaviour match `api.rs`/`epg.rs`. | verified |
| `troubleshooting-installation-startup/index.md` | Architecture, port and data-directory guidance matches the installers. | verified |
| `troubleshooting-server-and-maintenance/index.md` | Full/slim, Docker volume and update checks match the current code. | verified |
| `troubleshooting-reporting-logs/index.md` | Sanitization, log commands and the report template follow AGENTS.md; no raw evidence added. | verified |

### Maintenance

| Article | Finding and change | Status |
| --- | --- | --- |
| `maintenance/index.md` | List matches the section. | verified |
| `maintenance-update/index.md` | Version example updated; added that `ost update` returns a beta install to stable and how to pin a prerelease. | corrected |
| `maintenance-update-uninstall/index.md` | Paths and service removal match the installers. | verified |
| `maintenance-backup-restore/index.md` | Stopped-service backup and restore paths match `store.rs`. | verified |
| `maintenance-background-service/index.md` | systemd/Termux/OpenWrt commands match `autostart.rs`. | verified |
| `maintenance-docker/index.md` | Volume path and commands match `docker/Dockerfile`. | verified |
| `maintenance-openwrt/index.md` | apk/opkg and UCI paths match `openwrt/openstream`. | verified |
| `discord-release-notifications/index.md` | Workflow and secrets match `.github/workflows/discord-release-notification.yml`; dry-run commands unchanged. | verified |

## Feature-to-documentation coverage

| Feature | Where documented | State |
| --- | --- | --- |
| Full and slim builds | Installation overview, requirements, build-from-source | covered |
| Stable vs beta builds | Install a beta build, README, configuration reference, provider pages | covered (new) |
| First launch / admin password | First launch, 5 minutes, Settings | covered |
| Admin sign-in, sessions, sign-out | Admin sessions, Settings | covered |
| Live TV home, On now, rails | Navigation, live TV | covered |
| Channel search/filters/availability | Channels section of live TV, navigation, troubleshooting | covered |
| Programme guide page | Programme guide | covered (rewritten) |
| Live player controls | Live TV, watch-first-channel | covered |
| On demand catalogue | On demand | covered (text only; no capture) |
| IPTV playlist + XMLTV | IPTV playlists, configuration, VLC | covered |
| JioTV, JioTV+, Fastway sign-in | Account section | covered |
| Airtel / Playbox / Tata / VZY | Beta provider reference, beta install | covered as beta |
| CLI commands and flags | Configuration CLI | covered |
| TOML and `OPENSTREAM_*` | Configuration reference | covered |
| Ports, TLS, tunnels | Network security, CLI | covered |
| Data directory, backup, logs | Storage/logs, maintenance | covered |
| Update / uninstall | Maintenance | covered |
| Background services / OpenWrt | Maintenance | covered |
| Android app | Android install article | covered; device run not verified |
| Catch-up | Live TV and guide articles | explicitly not a supported web workflow |
| Custom channels JSON | Configuration reference only | gap: no task article; low priority |

## Screenshot inventory

All captures: commit `369b67e`, binary 1.6.0 built with `--features beta`,
macOS (Darwin) Chromium, viewport 1440×900 at 2× scale (2880×1800), disposable
data directory `/tmp/ost-docs`, provider **VZY free tier** (no account, no OTP).
Privacy: every saved image was inspected; the Settings image is cropped above
the playlist/EPG fields, so no access key appears.

| File | Scenario | Referenced by | Proves | Does not prove |
| --- | --- | --- | --- | --- |
| `first-launch-setup.png` | Fresh data directory setup card | 5 minutes, first launch | Setup form and its labels on 1.6.0 | Password policy beyond the 8-character minimum |
| `admin-sign-in.png` | Returning admin sign-in | First launch | Sign-in form and **Sign in** action | Provider login |
| `channels-vzy.png` | 29-channel VZY grid with filters | 5 minutes, navigation, watch-first-channel | Current filter set and tile layout | That channels play |
| `programme-guide-vzy.png` | Guide page with programme rows | Programme guide | Guide layout, times and progress | That schedules are current for every provider |
| `player-guide-vzy-playing.png` | Aaj Tak playing, quality and guide | Watch-first-channel, live TV | Player layout and one real playing channel | Other channels or providers |
| `settings-providers.png` | Provider login group, VZY active | JioTV, JioTV+, switch, requirements, navigation, Settings, beta install | Provider cards, Beta/Active pills, current Settings layout | IPTV URLs, which are cropped out |

Removed: `channels-jiotv-plus.png`, `player-guide-jiotv-plus.png`,
`settings-jiotv-plus.png`, `on-demand-jiotv-plus.png` (v1.5.0 top-navigation UI,
no longer accurate). No screenshot was added for On demand or Live TV home:
On demand returns 503 without JioTV+, and the VZY schedule was a day stale, so
the home rows displayed "Guide loading". Those pages are described in text
rather than shown misleadingly.

## Verification performed

- `python3 scripts/check-doc-links.py` — pass.
- `docs-site`: `bun install --frozen-lockfile`, `bun run check` (0 errors,
  1 pre-existing Svelte warning), `DOCS_BASE=/openstream-tv bun run build` —
  pass, 69 docs pages, Pagefind indexed 69 pages.
- Generated-output crawl: 68 article routes plus the home route, every image and
  every cross-page anchor resolved; 0 problems.
- Rendered checks: help centre, beta install article, live TV article, mobile
  article layout; sidebar/category navigation, previous/next links, callouts,
  tables, code blocks and Pagefind query "beta install" verified.
- App checks: `/api/channels` returned 29 VZY channels; one channel played
  (video ready, time advancing); other VZY channels returned provider errors.

## Blockers and evidence limits

- No JioTV, JioTV+, Fastway, Airtel Xstream, PlayboxTV or Tata Play account was
  available. Their screenshots and success paths are documented from source and
  prior evidence, not reproduced in this pass.
- No Android phone or TV was available, so the app layouts, file pickers and
  boot behaviour were checked against `android/README.md` and source only.
- No Docker image was pulled; Docker commands were checked against the Dockerfile
  and workflows.
- Product observation (not fixed): VZY's EPG endpoint returned programmes for
  the previous day, so Home rows fell back to "Guide loading". This is provider
  data, reported here rather than worked around in documentation.
- The preview tool adds a "Freebuff" badge to captures; it was hidden before each
  documentation screenshot and does not appear in the saved images.
