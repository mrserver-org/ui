let currentPath = "/";
let history = [currentPath];

async function getOS() {
  const os = await fetch(
    "http://" + window.location.host.split(":")[0] + ":9091" + "/api/system",
  );
  const osData = await os.json();
  if (osData.os === "win32") {
    currentPath = "C:\\";
    history = [currentPath];
  }
}

getOS();

async function fileContent(fullPath) {
  const isImage =
    fullPath.endsWith(".png") ||
    fullPath.endsWith(".jpg") ||
    fullPath.endsWith(".jpeg") ||
    fullPath.endsWith(".gif") ||
    fullPath.endsWith(".bmp") ||
    fullPath.endsWith(".webp") ||
    fullPath.endsWith(".hfif") ||
    fullPath.endsWith(".heic") ||
    fullPath.endsWith(".avif") ||
    fullPath.endsWith(".tiff") ||
    fullPath.endsWith(".tif");
  const complete_of_url = isImage
    ? "download"
    : "content" + `?path=${encodeURIComponent(fullPath)}`;
  const response = await fetch(
    "http://" +
      window.location.host.split(":")[0] +
      ":9091" +
      "/api/file_manager/" +
      complete_of_url,
  );
  const content = await response.text();
  if (isImage) {
    const mrcredentials = JSON.parse(localStorage.getItem("credentials"));
    const url =
      "http://" +
      window.location.host.split(":")[0] +
      ":9091" +
      "/api/file_manager/download" +
      `?path=${encodeURIComponent(fullPath)}&username=${mrcredentials.username}&password=${mrcredentials.password}`;
    createWindow(
      "Image Viewer",
      `
            <img class="content-image" src='${url}' alt="" style="width: 100%; height: 100%;">
        `,
      400,
      300,
    );
  } else {
    notesEdit(fullPath, content);
  }
}

async function loadDirectory(path) {
  const fileListDiv = document.getElementById("fileList");
  fileListDiv.innerHTML = "";
  document.getElementById("pathInput").value = path;
  try {
    const response = await fetch(
      "http://" +
        window.location.host.split(":")[0] +
        ":9091" +
        `/api/file_manager/list?path=${encodeURIComponent(path)}`,
    );
    const items = await response.json();

    items.forEach(({ name, path: fullPath, is_dir }) => {
      const fileItem = document.createElement("div");
      fileItem.classList.add("file-item");
      const icon = is_dir
        ? '<svg class="folder-icon" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>'
        : '<svg class="file-icon" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>';

      fileItem.innerHTML = `
                ${icon}
                <span class="file-name">${name}</span>
            `;
      fileItem.onclick = () => {
        if (is_dir) {
          history.push(fullPath);
          currentPath = fullPath;
          loadDirectory(currentPath);
        } else {
          fileContent(fullPath);
        }
      };
      fileListDiv.appendChild(fileItem);
    });
  } catch (error) {
    alert("Error loading directory");
  }
}

function goBack() {
  if (history.length > 1) {
    history.pop();
    currentPath = history[history.length - 1];
    loadDirectory(currentPath);
  }
}

function navigatePath() {
  const newPath = document.getElementById("pathInput").value;
  history.push(newPath);
  currentPath = newPath;
  loadDirectory(path);
}

function navigateTo(path) {
  history.push(path);
  currentPath = path;
  loadDirectory(path);
}

function fm() {
  createWindow(
    "File Manager",
    `
        <style>
            .file-manager {
                display: flex;
                height: 100%;
                background: var(--window-bg);
                color: var(--text);
            }

            .sidebar {
                width: 220px;
                background: var(--window-bg);
                border-right: 1px solid var(--border);
                padding: 8px;
            }

            .sidebar-button {
                width: 100%;
                padding: 8px 12px;
                text-align: left;
                border: none;
                background: none;
                border-radius: 4px;
                margin: 2px 0;
                cursor: pointer;
                color: var(--text);
            }

            .sidebar-button:hover {
                background: var(--accent);
            }

            .content {
                flex: 1;
                display: flex;
                flex-direction: column;
            }

            .toolbar {
                height: 48px;
                display: flex;
                align-items: center;
                padding: 0 8px;
                border-bottom: 1px solid var(--border);
                gap: 8px;
            }

            .input {
                padding: 6px 12px;
                border: 1px solid var(--border);
                border-radius: 4px;
                outline: none;
            }

            .input:focus {
                border-color: var(--accent);
            }

            #fileList {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 4px;
                padding: 8px;
                overflow-y: auto;
            }

            .file-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                user-select: none;
            }

            .file-item:hover {
                background: var(--accent);
            }

            .file-name {
                margin-left: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .folder-icon {
                color: #DCB67A;
            }

            .file-icon {
                color: #8E9199;
            }
        </style>
        <div class="file-manager">
            <div class="sidebar">
                <button class="sidebar-button" onclick="navigateTo('/')">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 8px">
                        <path fill="currentColor" d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7L12 2.7a1 1 0 0 0-1.4 0l-8.3 8.6A1 1 0 0 0 3 13z"/>
                    </svg>
                    Home
                </button>
                <button class="sidebar-button" onclick="navigateTo('/home')">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 8px">
                        <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                    </svg>
                    Documents
                </button>
            </div>
            <div class="content">
                <div class="toolbar">
                    <button class="win11-button" onclick="goBack()">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                    </button>
                    <input type="text" id="pathInput" class="input" style="flex: 1;" placeholder="Enter path">
                    <button onclick="navigatePath()">Go</button>
                </div>
                <div id="fileList"></div>
            </div>
        </div>
    `,
  );
  loadDirectory(currentPath);
}
