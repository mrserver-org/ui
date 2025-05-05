function notes() {
  createWindow(
    "Notes",
    `
    <div class="notes-app">
        <textarea autofocus class="notes-content" placeholder="Start typing..."></textarea>
    </div>
`,
    400,
    300,
    false,
    "📝"
  );
} /* MUST NOT END WITH A SEMICOLON */
