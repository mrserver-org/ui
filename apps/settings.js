const settingsSections = [];
function registerAppSettings(id, config) {
  settingsSections.push({ id, ...config });
}

function generateAppSettingsHTML() {
  return settingsSections
    .map((section) => {
      const controls = section.controls
        .map((control) => {
          let controlHTML = "";
          switch (control.type) {
            case "select":
              const options = control.options
                .map(
                  (opt) => `<option value="${opt.value}">${opt.label}</option>`,
                )
                .join("");
              controlHTML = `<select id="${control.id}" name="${control.id}" class="dropdown-control">${options}</select>`;
              break;
            case "text":
              controlHTML = `<input type="text" id="${control.id}" class="text-control" placeholder="${control.placeholder || ""}" ${control.readonly ? "readonly" : ""}>`;
              break;
            case "number":
              controlHTML = `<input type="number" id="${control.id}" class="text-control" min="${control.min || ""}" max="${control.max || ""}" step="${control.step || "1"}">`;
              break;
            case "checkbox":
              controlHTML = `<input type="checkbox" id="${control.id}" class="checkbox-control">`;
              break;
            case "range":
              controlHTML = `<div class="slider-container"><input type="range" id="${control.id}" class="range-control" min="${control.min || 0}" max="${control.max || 100}" step="${control.step || 1}"></input><div class="value-bubble bubble">16</div></div>`;
              break;
            default:
              controlHTML = `<input type="text" id="${control.id}" class="text-control">`;
          }

          return `
        <div class="control-group">
          <label for="${control.id}" class="control-label">${control.label}</label>
          <div class="control-wrapper">
            ${controlHTML}
            ${control.description ? `<div class="control-description">${control.description}</div>` : ""}
          </div>
        </div>
      `;
        })
        .join("");
      return `
      <fieldset class="settings-group">
        <legend class="group-title">${section.title}</legend>
        ${controls}
      </fieldset>
    `;
    })
    .join("");
}

function settings() {
  createWindow(
    "",
    `<center>
        <div id="settings-panel">
            <h1 class="window-title">Settings</h1>
            <div class="settings-container">
                <fieldset class="settings-group">
                    <legend class="group-title">Appearance</legend>
                    <div class="control-group">
                        <label for="theme" class="control-label">Theme</label>
                        <div class="control-wrapper">
                            <select id="theme" name="theme" class="dropdown-control"></select>
                            <div class="control-description">Select visual style for the MrServer</div>
                        </div>
                    </div>
                </fieldset>
                <fieldset class="settings-group">
                    <legend class="group-title">Shortcuts</legend>
                    <div class="control-group">
                        <label for="quicklaunch-shortcut" class="control-label">QuickLaunch</label>
                        <div class="control-wrapper">
                            <input type="text" id="quicklaunch-shortcut" class="text-control" placeholder="Press keys..." readonly>
                            <div class="control-description">Set keyboard shortcut for QuickLaunch</div>
                        </div>
                    </div>
                </fieldset>
                ${generateAppSettingsHTML()}
            </div>
            <div class="action-buttons">
                <button class="button primary" id="save-settings">Apply Changes</button>
            </div>
        </div>
        </center>
        <style>
.settings-container {
    padding: 16px;
    overflow-y: auto;
}
.settings-group {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 20px;
}
.group-title {
    font-weight: 600;
    padding: 0 8px;
}
.control-group {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
    align-items: center;
    margin-bottom: 12px;
}
.control-label {
    font-weight: 500;
    text-align: right;
}
.dropdown-control, .text-control {
    padding: 8px 12px;
    border-radius: 4px;
    width: 100%;
}
.text-control {
    cursor: pointer;
}
.text-control:focus {
    outline: 2px solid var(--accent);
}
.checkbox-control {
    width: auto;
    height: 16px;
}
.range-control {
    width: 100%;
}
.control-description {
    font-size: 0.9em;
    margin-top: 6px;
}
.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px;
    border-top: 1px solid var(--border);
}
.button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}
.button.primary {
    font-weight: 500;
}
.slider-container {
    position: relative;
    width: 300px;
    padding: 40px 0;
  }

  .value-bubble {
    position: absolute;
    top: -30px;
    left: 0;
    transform: translateX(-50%);
    background: var(--accent);
    color: var(--text);
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 12px;
    pointer-events: none;
    transition: left 0.05s;
  }

  input[type="range"] {
    width: 100%;
  }
    </style>
    `,
    480,
    400,
    false,
    "⚙️",
  );

  fetch("/themes/list.json")
    .then((response) => response.json())
    .then((data) => {
      const themeSelect = document.getElementById("theme");
      const savedTheme = localStorage.getItem("theme") || "default";
      data.forEach((theme) => {
        const option = new Option(theme.name, theme.filename);
        themeSelect.add(option);
      });
      themeSelect.value = savedTheme;
    });

  const shortcutInput = document.getElementById("quicklaunch-shortcut");
  const savedShortcut =
    localStorage.getItem("quicklaunch.keyboardshortcut") || "meta+k";
  shortcutInput.value = savedShortcut;
  let isCapturing = false;
  shortcutInput.addEventListener("focus", () => {
    isCapturing = true;
    shortcutInput.placeholder = "Press key combination...";
  });

  shortcutInput.addEventListener("blur", () => {
    isCapturing = false;
    shortcutInput.placeholder = "Press keys...";
  });

  shortcutInput.addEventListener("keydown", (e) => {
    if (!isCapturing) return;
    e.preventDefault();
    const keys = [];
    if (e.ctrlKey || e.metaKey) {
      keys.push("meta");
    }

    if (!["Control", "Meta", "Cmd"].includes(e.key)) {
      keys.push(e.key.toLowerCase());
    }

    if (keys.length > 1) {
      shortcutInput.value = keys.join("+");
    }
  });

  loadAppSettings();
  initRangeBubbles();
  document.getElementById("save-settings").addEventListener("click", () => {
    localStorage.setItem("theme", document.getElementById("theme").value);
    localStorage.setItem("quicklaunch.keyboardshortcut", shortcutInput.value);
    saveAppSettings();
    notify("MrServer", NotificationType.INFO, "Applying settings...");
    setTimeout(() => {
      location.reload();
    }, 2000);
  });
}

function loadAppSettings() {
  settingsSections.forEach((section) => {
    section.controls.forEach((control) => {
      const element = document.getElementById(control.id);
      if (!element) return;
      const savedValue =
        localStorage.getItem(`${section.id}.${control.id}`) || control.default;
      switch (control.type) {
        case "checkbox":
          element.checked = savedValue === "true";
          break;
        case "range":
        case "number":
          element.value = savedValue || control.default || 0;
          break;
        default:
          element.value = savedValue || control.default || "";
      }
    });
  });
}
function initRangeBubbles() {
  document.querySelectorAll(".slider-container").forEach((container) => {
    const range = container.querySelector('input[type="range"]');
    const bubble = container.querySelector(".value-bubble");
    function updateBubble() {
      const val = range.value;
      const min = range.min;
      const max = range.max;
      const percent = (val - min) / (max - min);
      const offset = range.offsetWidth * percent;
      bubble.style.left = `${offset}px`;
      bubble.textContent = val;
    }
    range.addEventListener("input", updateBubble);
    updateBubble();
  });
}

initRangeBubbles();
function saveAppSettings() {
  settingsSections.forEach((section) => {
    section.controls.forEach((control) => {
      const element = document.getElementById(control.id);
      if (!element) return;
      let value;
      switch (control.type) {
        case "checkbox":
          value = element.checked.toString();
          break;
        default:
          value = element.value;
      }

      localStorage.setItem(`${section.id}.${control.id}`, value);
    });
  });
}
