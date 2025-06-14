registerAppSettings("notes", {
  title: "Notes",
  controls: [
    {
      id: "font-size",
      type: "range",
      label: "Font Size",
      min: 10,
      max: 24,
      step: 1,
      default: 14
    },
    {
      id: "word-wrap",
      type: "checkbox",
      label: "Word Wrap",
      default: true
    }
  ]
});

function notes() {
  const win = createWindow(
    "Notes",
    `
    <div class="notes-app">
        <textarea autofocus class="notes-content-text" placeholder="Start typing..."></textarea>
    </div>
`,
    400,
    300,
    false,
    "📝",
  );
  const isWordWrap = getAppSetting("notes", "word-wrap", false);
  const whitespaceStyle = isWordWrap ? "normal" : "nowrap";
  win.querySelector(".notes-content-text").style.setProperty("white-space", whitespaceStyle, "important");
  win.querySelector(".notes-content-text").style.fontSize = `${getAppSetting("notes", "font-size", 14)}px`;
} /* MUST NOT END WITH A SEMICOLON */
