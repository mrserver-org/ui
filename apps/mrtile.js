class MrTile {
  constructor() {
    this.enabled = localStorage.getItem("mrtile.tile") === "true";
    this.layout = localStorage.getItem("mrtile.layout") || "dwindle";
    this.gaps = parseInt(localStorage.getItem("mrtile.gaps")) || 10;
    this.masterRatio =
      parseFloat(localStorage.getItem("mrtile.masterRatio")) || 0.6;
    this.tiledWindows = [];
    this.focusedWindow = null;
    this.layouts = {
      dwindle: this.dwindleLayout.bind(this),
      master: this.masterLayout.bind(this),
      grid: this.gridLayout.bind(this),
    };

    if (this.enabled) {
      this.init();
    }
  }

  init() {
    this.hijackWindowFunctions();
    this.setupKeyBindings();
    this.observeWindows();
  }

  hijackWindowFunctions() {
    const originalCreateWindow = window.createWindow;
    const originalCloseWindow = window.closeWindow;
    const originalFocusWindow = window.focusWindow;
    const originalMaximizeWindow = window.maximizeWindow;
    window.createWindow = (...args) => {
      const win = originalCreateWindow.apply(this, args);
      if (this.enabled && !win.classList.contains("window-widget")) {
        this.addWindow(win);
      }
      return win;
    };

    window.closeWindow = (win) => {
      if (this.enabled) {
        this.removeWindow(win);
      }
      originalCloseWindow(win);
    };

    window.focusWindow = (win) => {
      originalFocusWindow(win);
      if (this.enabled && this.tiledWindows.includes(win)) {
        if (this.focusedWindow !== win) {
          this.focusedWindow = win;
          this.updateFocusIndicator();
        }
      }
    };

    window.maximizeWindow = (win) => {
      if (this.enabled && this.tiledWindows.includes(win)) {
        this.toggleFloat(win);
      } else {
        originalMaximizeWindow(win);
      }
    };
  }

  setupKeyBindings() {
    document.addEventListener("keydown", (e) => {
      if (!this.enabled) return;
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        this.toggle();
      }

      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        if (this.focusedWindow) {
          this.toggleFloat(this.focusedWindow);
        }
      }

      if (e.ctrlKey && e.key === "j") {
        e.preventDefault();
        this.focusNext();
      }

      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        this.focusPrev();
      }

      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        this.adjustMasterRatio(-0.05);
      }

      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.adjustMasterRatio(0.05);
      }

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        this.swapWithMaster();
      }

      if (e.ctrlKey && (e.key === "1" || e.key === "2" || e.key === "3")) {
        e.preventDefault();
        const layouts = ["dwindle", "master", "grid"];
        this.setLayout(layouts[parseInt(e.key) - 1]);
      }
    });
  }

  observeWindows() {
    const observer = new MutationObserver((mutations) => {
      if (!this.enabled) return;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.classList &&
            node.classList.contains("window") &&
            !node.classList.contains("window-widget")
          ) {
            setTimeout(() => this.addWindow(node), 100);
          }
        });
      });
    });

    observer.observe(document.getElementById("desktop"), {
      childList: true,
      subtree: true,
    });
  }

  addWindow(win) {
    if (this.tiledWindows.includes(win)) return;
    win.classList.add("tiled");
    win.style.transition = "all 0.2s ease";
    this.tiledWindows.push(win);
    this.disableWindowResize(win);
    this.relayout();
  }

  removeWindow(win) {
    const index = this.tiledWindows.indexOf(win);
    if (index > -1) {
      this.tiledWindows.splice(index, 1);
      if (this.focusedWindow === win) {
        this.focusedWindow = this.tiledWindows[0] || null;
      }
      this.relayout();
    }
  }

  disableWindowResize(win) {
    win.querySelectorAll(".resize-handle").forEach((handle) => {
      handle.style.display = "none";
    });

    const header = win.querySelector(".window-header");
    header.onmousedown = null;
  }

  enableWindowResize(win) {
    win.querySelectorAll(".resize-handle").forEach((handle) => {
      handle.style.display = "block";
    });
    win.style.userSelect = "none";
    win.style.resize = "none";
    window.makeWindowDraggable(win);
  }

  toggleFloat(win) {
    if (win.classList.contains("floating")) {
      win.classList.remove("floating");
      this.addWindow(win);
    } else {
      win.classList.add("floating");
      this.removeWindow(win);
      this.enableWindowResize(win);
      win.style.transition = "none";
      win.style.transform = "none";
    }
  }

  relayout() {
    if (this.tiledWindows.length === 0) return;
    this.layouts[this.layout]();
    this.updateFocusIndicator();
  }

  dwindleLayout() {
    const desktop = document.getElementById("desktop");
    const availableWidth = desktop.clientWidth;
    const availableHeight = desktop.clientHeight - 40;
    if (this.tiledWindows.length === 1) {
      this.positionWindow(
        this.tiledWindows[0],
        this.gaps,
        this.gaps,
        availableWidth - 2 * this.gaps,
        availableHeight - 2 * this.gaps,
      );
      return;
    }

    this.dwindleRecursive(
      this.tiledWindows,
      this.gaps,
      this.gaps,
      availableWidth - 2 * this.gaps,
      availableHeight - 2 * this.gaps,
      true,
    );
  }

  dwindleRecursive(windows, x, y, width, height, splitVertical) {
    if (windows.length === 0) return;
    if (windows.length === 1) {
      this.positionWindow(windows[0], x, y, width, height);
      return;
    }

    const mid = Math.floor(windows.length / 2);
    const firstHalf = windows.slice(0, mid);
    const secondHalf = windows.slice(mid);
    if (splitVertical) {
      const firstWidth = Math.floor(width / 2) - this.gaps / 2;
      const secondWidth = width - firstWidth - this.gaps;
      this.dwindleRecursive(firstHalf, x, y, firstWidth, height, false);
      this.dwindleRecursive(
        secondHalf,
        x + firstWidth + this.gaps,
        y,
        secondWidth,
        height,
        false,
      );
    } else {
      const firstHeight = Math.floor(height / 2) - this.gaps / 2;
      const secondHeight = height - firstHeight - this.gaps;
      this.dwindleRecursive(firstHalf, x, y, width, firstHeight, true);
      this.dwindleRecursive(
        secondHalf,
        x,
        y + firstHeight + this.gaps,
        width,
        secondHeight,
        true,
      );
    }
  }

  masterLayout() {
    const desktop = document.getElementById("desktop");
    const availableWidth = desktop.clientWidth;
    const availableHeight = desktop.clientHeight - 40;
    if (this.tiledWindows.length === 1) {
      this.positionWindow(
        this.tiledWindows[0],
        this.gaps,
        this.gaps,
        availableWidth - 2 * this.gaps,
        availableHeight - 2 * this.gaps,
      );
      return;
    }

    const masterWidth = (availableWidth - 3 * this.gaps) * this.masterRatio;
    const slaveWidth = availableWidth - masterWidth - 3 * this.gaps;
    const slaveHeight =
      this.tiledWindows.length > 1
        ? (availableHeight - this.tiledWindows.length * this.gaps) /
          (this.tiledWindows.length - 1)
        : availableHeight - 2 * this.gaps;

    this.positionWindow(
      this.tiledWindows[0],
      this.gaps,
      this.gaps,
      masterWidth,
      availableHeight - 2 * this.gaps,
    );

    for (let i = 1; i < this.tiledWindows.length; i++) {
      const y = this.gaps + (i - 1) * (slaveHeight + this.gaps);
      this.positionWindow(
        this.tiledWindows[i],
        masterWidth + 2 * this.gaps,
        y,
        slaveWidth,
        slaveHeight,
      );
    }
  }

  gridLayout() {
    const desktop = document.getElementById("desktop");
    const availableWidth = desktop.clientWidth;
    const availableHeight = desktop.clientHeight - 40;
    const count = this.tiledWindows.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const windowWidth = (availableWidth - (cols + 1) * this.gaps) / cols;
    const windowHeight = (availableHeight - (rows + 1) * this.gaps) / rows;
    this.tiledWindows.forEach((win, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = this.gaps + col * (windowWidth + this.gaps);
      const y = this.gaps + row * (windowHeight + this.gaps);
      this.positionWindow(win, x, y, windowWidth, windowHeight);
    });
  }

  positionWindow(win, x, y, width, height) {
    win.style.left = Math.round(x) + "px";
    win.style.top = Math.round(y) + "px";
    win.style.width = Math.round(width) + "px";
    win.style.height = Math.round(height) + "px";
    win.style.transform = "none";
  }

  focusNext() {
    if (this.tiledWindows.length === 0) return;
    const currentIndex = this.tiledWindows.indexOf(this.focusedWindow);
    const nextIndex = (currentIndex + 1) % this.tiledWindows.length;
    window.focusWindow(this.tiledWindows[nextIndex]);
  }

  focusPrev() {
    if (this.tiledWindows.length === 0) return;
    const currentIndex = this.tiledWindows.indexOf(this.focusedWindow);
    const prevIndex =
      currentIndex === 0 ? this.tiledWindows.length - 1 : currentIndex - 1;
    window.focusWindow(this.tiledWindows[prevIndex]);
  }

  swapWithMaster() {
    if (this.tiledWindows.length < 2 || !this.focusedWindow) return;
    const focusedIndex = this.tiledWindows.indexOf(this.focusedWindow);
    if (focusedIndex > 0) {
      [this.tiledWindows[0], this.tiledWindows[focusedIndex]] = [
        this.tiledWindows[focusedIndex],
        this.tiledWindows[0],
      ];
      this.relayout();
    }
  }

  adjustMasterRatio(delta) {
    this.masterRatio = Math.max(0.1, Math.min(0.9, this.masterRatio + delta));
    localStorage.setItem("mrtile.masterRatio", this.masterRatio.toString());
    if (this.layout === "master") {
      this.relayout();
    }
  }

  setLayout(layout) {
    if (this.layouts[layout]) {
      this.layout = layout;
      localStorage.setItem("mrtile.layout", layout);
      this.relayout();
      notify("MrTile", "info", `Layout changed to ${layout}`);
    }
  }

  updateFocusIndicator() {
    this.tiledWindows.forEach((win) => {
      win.classList.toggle("focused", win === this.focusedWindow);
    });
  }

  toggle() {
    if (this.enabled) {
      this.enabled = false;
      localStorage.setItem("mrtile.tile", "false");
      this.tiledWindows.forEach((win) => {
        win.classList.remove("tiled");
        win.style.transition = "";
        win.style.border = "";
        this.enableWindowResize(win);
      });
      this.tiledWindows = [];
      notify("MrTile", "info", "Tiling disabled");
    } else {
      this.enabled = true;
      localStorage.setItem("mrtile.tile", "true");
      this.init();
      document
        .querySelectorAll(".window:not(.window-widget)")
        .forEach((win) => {
          this.addWindow(win);
        });
      notify("MrTile", "success", "Tiling enabled");
    }
  }

  setGaps(gaps) {
    this.gaps = Math.max(0, gaps);
    localStorage.setItem("mrtile.gaps", this.gaps.toString());
    this.relayout();
  }
}

registerAppSettings("mrtile", {
  title: "Window Tiling (MrTile)",
  controls: [
    {
      id: "tile",
      type: "checkbox",
      label: "Enable Tiling",
      default: false,
    },
    {
      id: "layout",
      type: "select",
      label: "Default Layout",
      options: [
        { value: "dwindle", label: "Dwindle (Binary Split)" },
        { value: "master", label: "Master-Stack" },
        { value: "grid", label: "Grid" },
      ],
      default: "dwindle",
    },
    {
      id: "gaps",
      type: "range",
      label: "Window Gaps",
      description: "Space between tiled windows (pixels)",
      min: 0,
      max: 50,
      step: 1,
      default: 10,
    },
    {
      id: "masterRatio",
      type: "range",
      label: "Master Window Ratio",
      description: "Size ratio of master window in master layout",
      min: 0.0,
      max: 0.9,
      step: 0.1,
      default: 0.6,
    },
  ],
});

function loadMrTileSettings() {
  const enabled = document.getElementById("mrtile-enabled");
  const layout = document.getElementById("mrtile-layout");
  const gaps = document.getElementById("mrtile-gaps");
  const masterRatio = document.getElementById("mrtile-master-ratio");
  if (enabled) {
    enabled.checked = localStorage.getItem("mrtile.tile") === "true";
    enabled.addEventListener("change", () => {
      localStorage.setItem("mrtile.tile", enabled.checked.toString());
      window.MrTile.enabled = enabled.checked;
      window.MrTile.toggle();
    });
  }

  if (layout) {
    layout.value = localStorage.getItem("mrtile.layout") || "dwindle";
    layout.addEventListener("change", () => {
      window.MrTile.setLayout(layout.value);
    });
  }

  if (gaps) {
    gaps.value = localStorage.getItem("mrtile.gaps") || "10";
    const gapsBubble = gaps.parentElement.querySelector(".value-bubble");
    if (gapsBubble) gapsBubble.textContent = gaps.value + "px";
    gaps.addEventListener("input", () => {
      if (gapsBubble) gapsBubble.textContent = gaps.value + "px";
      window.MrTile.setGaps(parseInt(gaps.value));
    });
  }

  if (masterRatio) {
    masterRatio.value = Math.round(
      (parseFloat(localStorage.getItem("mrtile.masterRatio")) || 0.6) * 100,
    );
    const ratioBubble =
      masterRatio.parentElement.querySelector(".value-bubble");
    if (ratioBubble) ratioBubble.textContent = masterRatio.value + "%";
    masterRatio.addEventListener("input", () => {
      if (ratioBubble) ratioBubble.textContent = masterRatio.value + "%";
      const ratio = parseFloat(masterRatio.value) / 100;
      window.MrTile.masterRatio = ratio;
      localStorage.setItem("mrtile.masterRatio", ratio.toString());
      if (window.MrTile.layout === "master") {
        window.MrTile.relayout();
      }
    });
  }
}

setTimeout(() => {
  if (typeof loadMrTileSettings === "function") {
    loadMrTileSettings();
  }
}, 1000);

window.MrTile = new MrTile();
