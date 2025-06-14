v1.0.0 "Apollo"

- Initital Release

v1.1.0

- Added a seperate non-git-checked folder ("third_party_apps") for third party apps.s
- Added support for ESM in apps if their file name starts with "m\_". e.g. "m_calculator.js".
- Added `expose(func)` to expose functions if using ESM.

v1.2.0

- Added start menu icons for third party apps.
- New Notification API!
- Added Role-based authentication.

v1.2.1

- Fixed terminal not authenticating properly.
- Fixed File Manager not loading images

v2.0.0 "Blitz"

- Added new built-in app, Process Manager!
- Modified `alert` API to use MrServer windows.
  Now: `alert(message, title = "Alert", width = 400, height = 400)`
  Before: `alert(message)` (old one can be called using `mralert(message)`
- Reduced themes file sizes by putting universal stuff in global.css
- Added Scheduler App
- Material 3 Theme! (+ wallpaper)
- Removed uptime from system info because it wasnt working.
- Added NodeJS, Yarn, Docker and NPM versions.
- Made system info app real-time info. (beta)
- Added Taskbar Icons, that focuses windows and destroyes if the window is destroyed (beta, might have bugs)
- Added Auto-Maximize Windows if device is a phone/small screen device.
- New feature! `QuickLaunch`, a Spotlight Search (like) app launcher for MrServer. (+ customizable keyboard shortcut. default: meta+k)
- Added New API! (`await generateApps()`) which gives an array of the system and third-party apps. example: `[{"title": "app name", "icon": "icon", "subtitle": "System App", "category": "system", "function": "appfunction()"}]`
- Made folder and file icons in File Manager adaptive to theme
- Added New API! `moveWindowTo(x, y, animate = false)`
- New feature! Registering app settings and users modify app settings from the MrServer Settings App.
- Added New API! `registerAppSettings(id, config)`:
  `id` is the App ID.
  `config` is an `Object` with `title`, `controls`.
  `controls` is an object array with these for each object:
  `id`, `type` (range, number, select, checkbox, text (default)), `label`, `min` (number,range), `max` (number,range), `step` (number,range), `default`, `placeholder` (text), `readonly` (text), `value` (select)

- Added New API! `getAppSetting(appId, settingId, fallback = null)`
- Added New API! `setAppSetting(appId, settingId, value)`
- Added new feature! Widgets are here!
- Added New API! `createWidget(id, html, width, height, x, y, updateFn, options = {})`
- Fixed order in JS files.
- New built-in app! MrTile, dynamic tiling for MrServer! activate it from the settings.
- New built-in app! MrSnap, window snapping for MrServer! activate it from the settings.
