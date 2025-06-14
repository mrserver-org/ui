class MrSnap {
  constructor() {
    this.enabled = localStorage.getItem("mrsnap.enabled") !== "false";
    this.snapDistance = parseInt(localStorage.getItem("mrsnap.distance")) || 20;
    this.snapZones = JSON.parse(localStorage.getItem("mrsnap.zones")) || ["left", "right", "top", "maximize"];
    this.showPreview = localStorage.getItem("mrsnap.preview") !== "false";
    this.snapSensitivity = parseInt(localStorage.getItem("mrsnap.sensitivity")) || 10;
    this.isDragging = false;
    this.draggedWindow = null;
    this.snapPreview = null;
    this.snapZone = null;
    this.zones = {
      left: { x: 0, y: 0, width: 0.5, height: 1 },
      right: { x: 0.5, y: 0, width: 0.5, height: 1 },
      top: { x: 0, y: 0, width: 1, height: 0.5 },
      bottom: { x: 0, y: 0.5, width: 1, height: 0.5 },
      topleft: { x: 0, y: 0, width: 0.5, height: 0.5 },
      topright: { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      bottomleft: { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      bottomright: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
      maximize: { x: 0, y: 0, width: 1, height: 1 }
    };
    
    if (this.enabled) {
      this.init();
    }
  }

  init() {
    this.hijackWindowFunctions();
    this.createSnapPreview();
    this.setupMouseEvents();
    this.setupKeyBindings();
  }

  hijackWindowFunctions() {
    const originalMakeWindowDraggable = window.makeWindowDraggable;
    window.makeWindowDraggable = (win) => {
      const header = win.querySelector('.window-header');
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      header.onmousedown = (e) => {
        if (!this.enabled) {
          originalMakeWindowDraggable(win);
          return;
        }
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        this.isDragging = true;
        this.draggedWindow = win;
        document.onmouseup = () => this.stopDrag();
        document.onmousemove = (e) => this.handleDrag(e);
        window.focusWindow(win);
      };
    };
  }

  handleDrag(e) {
    if (!this.isDragging || !this.draggedWindow) return;
    e.preventDefault();
    const pos1 = e.clientX - this.startX;
    const pos2 = e.clientY - this.startY;
    this.draggedWindow.style.left = (this.draggedWindow.offsetLeft + pos1) + 'px';
    this.draggedWindow.style.top = (this.draggedWindow.offsetTop + pos2) + 'px';
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.checkSnapZones(e.clientX, e.clientY);
  }

  stopDrag() {
    if (!this.isDragging) return;
    document.onmouseup = null;
    document.onmousemove = null;
    if (this.snapZone && this.draggedWindow) {
      this.snapToZone(this.draggedWindow, this.snapZone);
    }
    this.hideSnapPreview();
    this.isDragging = false;
    this.draggedWindow = null;
    this.snapZone = null;
  }

  checkSnapZones(mouseX, mouseY) {
    if (!this.showPreview) return;
    const desktop = document.getElementById('desktop');
    const rect = desktop.getBoundingClientRect();
    const threshold = this.snapSensitivity;
    let zone = null;
    if (mouseX <= rect.left + threshold) {
      if (mouseY <= rect.top + threshold && this.snapZones.includes('topleft')) {
        zone = 'topleft';
      } else if (mouseY >= rect.bottom - threshold && this.snapZones.includes('bottomleft')) {
        zone = 'bottomleft';
      } else if (this.snapZones.includes('left')) {
        zone = 'left';
      }
    } else if (mouseX >= rect.right - threshold) {
      if (mouseY <= rect.top + threshold && this.snapZones.includes('topright')) {
        zone = 'topright';
      } else if (mouseY >= rect.bottom - threshold && this.snapZones.includes('bottomright')) {
        zone = 'bottomright';
      } else if (this.snapZones.includes('right')) {
        zone = 'right';
      }
    } else if (mouseY <= rect.top + threshold) {
      if (this.snapZones.includes('maximize')) {
        zone = 'maximize';
      } else if (this.snapZones.includes('top')) {
        zone = 'top';
      }
    } else if (mouseY >= rect.bottom - threshold && this.snapZones.includes('bottom')) {
      zone = 'bottom';
    }
    
    if (zone !== this.snapZone) {
      this.snapZone = zone;
      if (zone) {
        this.showSnapPreview(zone);
      } else {
        this.hideSnapPreview();
      }
    }
  }

  createSnapPreview() {
    this.snapPreview = document.createElement('div');
    this.snapPreview.id = 'snap-preview';
    this.snapPreview.style.cssText = `
      position: absolute;
      background: rgba(0, 122, 204, 0.3);
      border: 2px solid #007acc;
      border-radius: 4px;
      pointer-events: none;
      z-index: 9999;
      display: none;
      transition: all 0.1s ease;
    `;
    document.getElementById('desktop').appendChild(this.snapPreview);
  }

  showSnapPreview(zone) {
    if (!this.snapPreview || !this.zones[zone]) return;
    const desktop = document.getElementById('desktop');
    const zoneData = this.zones[zone];
    const x = desktop.clientWidth * zoneData.x;
    const y = desktop.clientHeight * zoneData.y;
    const width = desktop.clientWidth * zoneData.width;
    const height = (desktop.clientHeight - 40) * zoneData.height;
    this.snapPreview.style.left = x + 'px';
    this.snapPreview.style.top = y + 'px';
    this.snapPreview.style.width = width + 'px';
    this.snapPreview.style.height = height + 'px';
    this.snapPreview.style.display = 'block';
  }

  hideSnapPreview() {
    if (this.snapPreview) {
      this.snapPreview.style.display = 'none';
    }
  }

  snapToZone(win, zone) {
    if (!this.zones[zone]) return;
    const desktop = document.getElementById('desktop');
    const zoneData = this.zones[zone];
    const x = desktop.clientWidth * zoneData.x;
    const y = desktop.clientHeight * zoneData.y;
    const width = desktop.clientWidth * zoneData.width;
    const height = (desktop.clientHeight - 40) * zoneData.height;
    win.style.transition = 'all 0.2s ease';
    win.style.left = x + 'px';
    win.style.top = y + 'px';
    win.style.width = width + 'px';
    win.style.height = height + 'px';
    setTimeout(() => {
      win.style.transition = '';
    }, 200);
    win.classList.add('snapped');
    win.dataset.snapZone = zone;
  }

  setupMouseEvents() {
    document.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      const header = e.target.closest('.window-header');
      if (header) {
        this.startX = e.clientX;
        this.startY = e.clientY;
      }
    });
  }

  setupKeyBindings() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled || !e.ctrlKey) return;
      const focused = window.activeWindow;
      if (!focused) return;
      let zone = null;
      switch (e.key) {
        case 'ArrowLeft':
          zone = 'left';
          break;
        case 'ArrowRight':
          zone = 'right';
          break;
        case 'ArrowUp':
          zone = e.ctrlKey ? 'maximize' : 'top';
          break;
        case 'ArrowDown':
          zone = 'bottom';
          break;
      }

      if (zone && this.snapZones.includes(zone)) {
        e.preventDefault();
        this.snapToZone(focused, zone);
        notify("MrSnap", "info", `Snapped to ${zone}`);
      }
    });
  }

  unsnap(win) {
    if (!win.classList.contains('snapped')) return;
    win.classList.remove('snapped');
    delete win.dataset.snapZone;
    win.style.width = '400px';
    win.style.height = '300px';
    win.style.left = '50px';
    win.style.top = '50px';
  }

  snapWindow(win, zone) {
    if (this.zones[zone] && this.snapZones.includes(zone)) {
      this.snapToZone(win, zone);
    }
  }

  setSnapDistance(distance) {
    this.snapDistance = Math.max(5, Math.min(50, distance));
    localStorage.setItem("mrsnap.distance", this.snapDistance.toString());
  }

  setSensitivity(sensitivity) {
    this.snapSensitivity = Math.max(5, Math.min(50, sensitivity));
    localStorage.setItem("mrsnap.sensitivity", this.snapSensitivity.toString());
  }

  toggleZone(zone) {
    const index = this.snapZones.indexOf(zone);
    if (index > -1) {
      this.snapZones.splice(index, 1);
    } else {
      this.snapZones.push(zone);
    }
    localStorage.setItem("mrsnap.zones", JSON.stringify(this.snapZones));
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("mrsnap.enabled", this.enabled.toString());
    if (this.enabled) {
      this.init();
      notify("MrSnap", "success", "Window snapping enabled");
    } else {
      this.hideSnapPreview();
      notify("MrSnap", "info", "Window snapping disabled");
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    localStorage.setItem("mrsnap.preview", this.showPreview.toString());
    if (!this.showPreview) {
      this.hideSnapPreview();
    }
  }
}

registerAppSettings('mrsnap', {
  title: 'Window Snapping (MrSnap)',
  controls: [
    {
      id: 'enabled',
      type: 'checkbox',
      label: 'Enable Window Snapping'
    },
    {
      id: 'preview',
      type: 'checkbox',
      label: 'Show Snap Preview',
    },
    {
      id: 'sensitivity',
      type: 'range',
      label: 'Edge Sensitivity',
      description: 'Distance from edge to trigger snapping (pixels)',
      min: 5,
      max: 50,
      step: 1
    } 
  ]
});

function loadMrSnapSettings() {
  const enabled = document.getElementById('mrsnap-enabled');
  const preview = document.getElementById('mrsnap-preview');
  const sensitivity = document.getElementById('mrsnap-sensitivity');
  const zoneLeft = document.getElementById('mrsnap-zones-left');
  const zoneRight = document.getElementById('mrsnap-zones-right');
  const zoneTop = document.getElementById('mrsnap-zones-top');
  const zoneMaximize = document.getElementById('mrsnap-zones-maximize');
  const zoneCorners = document.getElementById('mrsnap-zones-corners');
  if (enabled) {
    enabled.checked = localStorage.getItem("mrsnap.enabled") !== "false";
    enabled.addEventListener('change', () => {
      window.MrSnap.enabled = enabled.checked;
      window.MrSnap.toggle();
    });
  }
  
  if (preview) {
    preview.checked = localStorage.getItem("mrsnap.preview") !== "false";
    preview.addEventListener('change', () => {
      window.MrSnap.showPreview = preview.checked;
      window.MrSnap.togglePreview();
    });
  }
  
  if (sensitivity) {
    sensitivity.value = localStorage.getItem("mrsnap.sensitivity") || "10";
    const sensitivityBubble = sensitivity.parentElement.querySelector('.value-bubble');
    if (sensitivityBubble) sensitivityBubble.textContent = sensitivity.value + 'px';
    sensitivity.addEventListener('input', () => {
      if (sensitivityBubble) sensitivityBubble.textContent = sensitivity.value + 'px';
      window.MrSnap.setSensitivity(parseInt(sensitivity.value));
    });
  }
  
  const zones = JSON.parse(localStorage.getItem("mrsnap.zones")) || ["left", "right", "top", "maximize"];
  if (zoneLeft) {
    zoneLeft.checked = zones.includes('left');
    zoneLeft.addEventListener('change', () => window.MrSnap.toggleZone('left'));
  }
  
  if (zoneRight) {
    zoneRight.checked = zones.includes('right');
    zoneRight.addEventListener('change', () => window.MrSnap.toggleZone('right'));
  }
  
  if (zoneTop) {
    zoneTop.checked = zones.includes('top');
    zoneTop.addEventListener('change', () => window.MrSnap.toggleZone('top'));
  }
  
  if (zoneMaximize) {
    zoneMaximize.checked = zones.includes('maximize');
    zoneMaximize.addEventListener('change', () => window.MrSnap.toggleZone('maximize'));
  }
  
  if (zoneCorners) {
    const hasCorners = zones.includes('topleft') || zones.includes('topright') || 
                      zones.includes('bottomleft') || zones.includes('bottomright');
    zoneCorners.checked = hasCorners;
    zoneCorners.addEventListener('change', () => {
      ['topleft', 'topright', 'bottomleft', 'bottomright'].forEach(corner => {
        if (zoneCorners.checked && !zones.includes(corner)) {
          window.MrSnap.toggleZone(corner);
        } else if (!zoneCorners.checked && zones.includes(corner)) {
          window.MrSnap.toggleZone(corner);
        }
      });
    });
  }
}

setTimeout(() => {
  if (typeof loadMrSnapSettings === 'function') {
    loadMrSnapSettings();
  }
}, 1000);

window.MrSnap = new MrSnap();
