const widget = createWidget(
  "time",
  `<h1 id="time"></h1>`,
  200,
  70,
  "5%",
  "95%",
  (widget) => {
    widget.querySelector("#time").textContent = new Date().toLocaleTimeString();
  },
  { transparent: true, blurBehind: false },
);
