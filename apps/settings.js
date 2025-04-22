function settings() {
  createWindow(
    "",
    `
        <center>
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
    max-height: 240px;
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

.dropdown-control {
    padding: 8px 12px;
    border-radius: 4px;
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
    </style>
    `,
    480,
    320,
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

  document.getElementById("save-settings").addEventListener("click", () => {
    localStorage.setItem("theme", document.getElementById("theme").value);
    notify("MrServer", NotificationType.INFO, "Applying theme...");
    setTimeout(() => {
        location.reload();
    }, 2000);
  });
}
