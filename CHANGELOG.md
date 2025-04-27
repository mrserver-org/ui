v1.0.0

- Initital Release

v1.1.0

- Added a seperate non-git-checked folder ("third_party_apps") for third party apps.s
- Added support for ESM in apps if their file name starts with "m_". e.g. "m_calculator.js".
- Added `expose(func)` to expose functions if using ESM.

v1.2.0

- Added start menu icons for third party apps.
- New Notification API!
- Added Role-based authentication.

v1.2.1

- Fixed terminal not authenticating properly.
- Fixed File Manager not loading images

WIP

- Added new built-in app, Process Manager!
- Modified `alert` API to use MrServer windows.
Now: `alert(message, title = "Alert", width = 400, height = 400)`
Before: `alert(message)` (old one can be called using `mralert(message)`
- Reduced themes file sizes by putting universal stuff in global.css
- Added Scheduler App