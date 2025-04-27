function terminal() {
  const win = createWindow(
    "Terminal",
    `<div id="terminal" style="background:transparent;position:absolute;left:0;right:0;width:100%;height:100%;"></div>`,
  );
  const term = new Terminal({
    allowTransparency: true,
    theme: {
      background: "var(--bg-color)",
      foreground: "var(--text)",
    },
  });
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname;
  const mrcredentials = JSON.parse(localStorage.getItem("credentials"));
  const ws = new WebSocket(
    `${protocol}://${host}:9091/api/terminal?username=${mrcredentials.username}&password=${mrcredentials.password}`,
  );
  let resizeObserver;

  const calculateDimensions = () => {
    const container = win.querySelector(".window-content");
    if (!container) return { cols: 80, rows: 24 };

    const style = getComputedStyle(term.element);
    const charWidth = measureTextWidth("W", style.fontFamily, style.fontSize);
    const lineHeight =
      parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;

    return {
      cols: Math.floor(container.offsetWidth / charWidth),
      rows: Math.floor(container.offsetHeight / lineHeight),
    };
  };

  const measureTextWidth = (text, fontFamily, fontSize) => {
    const span = document.createElement("span");
    span.style.cssText = `position:absolute;visibility:hidden;font-family:${fontFamily};font-size:${fontSize}`;
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  };

  const handleResize = () => {
    const { cols, rows } = calculateDimensions();
    term.resize(cols, rows);
    ws.send(JSON.stringify({ type: "resize", cols, rows }));
  };

  ws.onopen = () => {
    term.open(win.querySelector("#terminal"));
    handleResize();
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(win.querySelector(".window-content"));
  };

  ws.onclose = () => {
    resizeObserver?.disconnect();
    term.dispose();
  };

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onmessage = (event) => term.write(event.data);

  term.onKey(({ key }) => ws.send(JSON.stringify({ key })));

  term.options.theme = {
    background: "var(--window-bg)",
    foreground: "var(--text)",
  };
}
