function info() {
  const windowId = createWindow(
    "System Info",
    `
        <div class="system-dashboard">
            <div class="loading-bar"></div>
            <div class="dashboard-content hidden">
                <div class="grid-container">
                    <div class="card system-overview">
                        <h2>Overview</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <label>OS</label>
                                <span class="os-platform">-</span>
                            </div>
                            <div class="stat-item">
                                <label>Hostname</label>
                                <span class="hostname">-</span>
                            </div>
                            <div class="stat-item">
                                <label>Hardware Model</label>
                                <span class="hardware-model">-</span>
                            </div>
                            <div class="stat-item">
                                <label>Node JS</label>
                                <span class="nodejsver">-</span>
                            </div>
                            <div class="stat-item">
                                <label>NPM</label>
                                <span class="npmver">-</span>
                            </div>
                            <div class="stat-item">
                                <label>Yarn</label>
                                <span class="yarnver">-</span>
                            </div>
                            <div class="stat-item">
                                <label>Docker</label>
                                <span class="dockerver">-</span>
                            </div>
                        </div>
                    </div>

                    <div class="card resource-monitor">
                        <h2>Resources</h2>
                        <div class="resource-grid">
                            <div class="resource-item">
                            <label>CPU Load</label>
                                <div class="circular-progress cpu-usage">
                                    <div class="progress-ring"></div>
                                    <div class="progress-text">-</div>
                                </div>
                            </div>
                            <div class="resource-item">
                                <label>Memory Usage</label>
                                <div class="circular-progress memory-usage">
                                    <div class="progress-ring"></div>
                                    <div class="progress-text">-</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card storage-info">
                        <h2>Storage</h2>
                        <div class="disks-container"></div>
                    </div>

                    <div class="card network-info">
                        <h2>Network</h2>
                        <div class="interfaces-container"></div>
                    </div>
                </div>
            </div>
            <div class="error-message hidden"></div>
        </div>
        <style>
            .window-system-info {
                --success-color: #00c853;
                --warning-color: #ffab00;
                --error-color: #d50000;
            }

            .loading-bar {
                height: 3px;
                width: 0;
                background: var(--accent);
                transition: width 0.3s ease;
                position: absolute;
                top: 0;
                left: 0;
            }

            .dashboard-content {
                padding: 1.5rem;
            }

            .grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .card {
                background: var(--window-bg);
                border-radius: 12px;
                padding: 1.5rem;
            }

            .card h2 {
                margin: 0 0 1.5rem 0;
                font-size: 1.25rem;
                color: var(--text);
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
            }

            .stat-item label {
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
            }

            .circular-progress {
                width: 100px;
                height: 100px;
                position: relative;
                margin: 0 auto;
            }

            .progress-ring {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
                border-radius: 50%;
            }

            .progress-ring circle {
                fill: none;
                stroke-width: 8;
                stroke-linecap: round;
                transition: stroke-dashoffset 0.5s ease;
            }

            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.25rem;
                font-weight: 500;
            }

            .disk-progress {
                margin: 0.5rem 0;
                height: 8px;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .disk-progress-bar {
                height: 100%;
                transition: width 0.5s ease;
            }

            .interface-item {
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }

            .hidden {
                display: none;
            }

            .error-message {
                color: var(--error-color);
                padding: 2rem;
                text-align: center;
            }
        </style>
    `,
    800,
    600,
    false,
    "📊",
  ).id;

  const contentWindow = document.getElementById(windowId);
  const loadingBar = contentWindow.querySelector(".loading-bar");
  const dashboardContent = contentWindow.querySelector(".dashboard-content");
  const errorMessage = contentWindow.querySelector(".error-message");

  async function firstFetchSystemInfo() {
    await fetchSystemInfo();
    notify(
      "System Info",
      NotificationType.INFO,
      "Loaded system info sucessfully!",
    );
  }

  async function fetchSystemInfo() {
    try {
      loadingBar.style.width = "30%";
      const response = await fetch(
        `http://${window.location.hostname}:9091/api/system`,
      );
      loadingBar.style.width = "60%";
      const data = await response.json();
      loadingBar.style.width = "100%";
      setTimeout(() => {
        dashboardContent.classList.remove("hidden");
        updateUI(data);
        loadingBar.style.width = "0";
      }, 300);
    } catch (error) {
      loadingBar.style.width = "0";
      dashboardContent.classList.add("hidden");
      errorMessage.classList.remove("hidden");
      errorMessage.textContent = "Failed to fetch system information";
      console.error("Fetch error:", error);
    }
  }

  function updateUI(data) {
    contentWindow.querySelector(".os-platform").textContent =
      `${data.os.distro} ${data.os.version}`;
    contentWindow.querySelector(".hostname").textContent = data.os.hostname;
    contentWindow.querySelector(".nodejsver").textContent =
      data.software.node ?? "Not Installed"; // impossible
    contentWindow.querySelector(".npmver").textContent =
      data.software.npm ?? "Not Installed";
    contentWindow.querySelector(".yarnver").textContent =
      data.software.yarn ?? "Not Installed";
    contentWindow.querySelector(".dockerver").textContent =
      data.software.docker ?? "Not Installed";
    contentWindow.querySelector(".hardware-model").textContent =
      `${data.hardware.manufacturer} ${data.hardware.version}`;
    const cpuProgress = contentWindow.querySelector(
      ".cpu-usage .progress-ring",
    );
    const cpuText = contentWindow.querySelector(".cpu-usage .progress-text");
    const cpuLoad = data.cpu.load.toFixed(1);
    const cpuCircumference = 2 * Math.PI * 45;
    cpuProgress.innerHTML = `<circle cx="50" cy="50" r="45" stroke="var(--accent)" stroke-dasharray="${cpuCircumference}" stroke-dashoffset="${cpuCircumference - (cpuLoad / 100) * cpuCircumference}"/>`;
    cpuText.textContent = `${cpuLoad}%`;
    const memUsed = data.memory.used / 1024 ** 3;
    const memTotal = data.memory.total / 1024 ** 3;
    const memPercent = ((data.memory.used / data.memory.total) * 100).toFixed(
      1,
    );
    const memProgress = contentWindow.querySelector(
      ".memory-usage .progress-ring",
    );
    const memText = contentWindow.querySelector(".memory-usage .progress-text");
    memProgress.innerHTML = `<circle cx="50" cy="50" r="45" stroke="var(--border)" stroke-dasharray="${cpuCircumference}" stroke-dashoffset="${cpuCircumference - (memPercent / 100) * cpuCircumference}"/>`;
    memText.textContent = `${memPercent}%`;
    const disksContainer = contentWindow.querySelector(".disks-container");
    disksContainer.innerHTML = data.storage.disks
      .map(
        (disk) => `
            <div class="disk-item">
                <div class="disk-header">
                    <span>${disk.mount} (${disk.type})</span>
                    <span>${(disk.used / 1024 ** 3).toFixed(1)}GiB / ${(disk.size / 1024 ** 3).toFixed(1)}GiB</span>
                </div>
                <div class="disk-progress">
                    <div class="disk-progress-bar" style="width: ${((disk.used / disk.size) * 100).toFixed(1)}%; background: var(--accent)"></div>
                </div>
            </div>
        `,
      )
      .join("");
    const interfacesContainer = contentWindow.querySelector(
      ".interfaces-container",
    );
    interfacesContainer.innerHTML = data.network.interfaces
      .filter((iface) => iface.ip4)
      .map(
        (iface) => `
                <div class="interface-item">
                    <div><strong>${iface.iface}</strong></div>
                    <div>IPv4: ${iface.ip4}</div>
                    <div>MAC: ${iface.mac}</div>
                </div>
            `,
      )
      .join("");
    fetchSystemInfo();
  }

  firstFetchSystemInfo();
}
