const container = document.getElementById('notifications-container');
let notificationCounter = 0;
const NotificationType = {
  INFO: "info",
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
};

const mrfetch = window.fetch;
window.fetch = function(input, init = {}) {
  const credentials = JSON.parse(localStorage.getItem("credentials") || "{}");
  init.headers = {
    ...(init.headers || {}),
    username: credentials.username,
    password: credentials.password
  };
  
  return mrfetch(input, init);
};

function isPhone() {
  return window.innerWidth <= 768;
}

function isMobileUserAgent() {
  return /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const mralert = window.alert;
window.alert = function(message, title = "Alert", width = 100, height = 50) {
  let alertId = message.trim().substr(1,9) + title.trim(); // tbh, thats weird ID idea ever
  let alertBox;
  alertBox = createWindow(title,`
        <div class="dialog alert-box" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%;">
		    <div class="alert-message dialog-title">${title}</div>
            <div class="alert-message dialog-content">${message}</div>
			<br>
            <div class="dialog-actions">
                <button class="alert-button" id="${alertId}">OK</button>
            </div>
        </div>
    `, width, height, true);
  alertBox.querySelector(".window-header").remove();
  alertBox.style.top = `40%`;
  alertBox.style.left = `40%`;
  document.getElementById(alertId).onclick = () => {
	  closeWindow(alertBox);
  };
};

function notify(app, type, message) {
  const validTypes = ["info", "success", "warning", "error"];
  if (!validTypes.includes(type)) {
    type = "info";
  }
  const id = "notification-" + ++notificationCounter;
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.id = id;
  let iconContent = "i";
  if (type === "success") iconContent = "✓";
  if (type === "warning") iconContent = "!";
  if (type === "error") iconContent = "×";
  notification.innerHTML = `
        <div class="notification-header">
            <div class="app-icon ${type}">${iconContent}</div>
            <div class="app-name">${app}</div>
            <div class="notification-time">Just now</div>
        </div>
        <div class="notification-body">
            ${message}
        </div>
    `;
  container.appendChild(notification);
  setTimeout(() => {
    const notificationToRemove = document.getElementById(id);
    if (notificationToRemove) {
      notificationToRemove.classList.add("removing");
      setTimeout(() => {
        if (notificationToRemove.parentNode) {
          notificationToRemove.parentNode.removeChild(notificationToRemove);
        }
      }, 300);
    }
  }, 5000);
}

async function generateApps() {
  const apps = []; 
  try {
    const systemResponse = await fetch("./apps/list.json");
    const systemData = await systemResponse.json();
    systemData.forEach((app) => {
      apps.push({
        title: app.name,
        subtitle: "System App",
        icon: app.icon,
        category: "builtin",
        function: app.function
      });
    });
  } catch (error) {
    console.error("Failed to load system apps:", error);
  }
  
  try {
    const thirdPartyResponse = await fetch("./3rd_party_apps/list.json");
    const thirdPartyData = await thirdPartyResponse.json();
    thirdPartyData.forEach((app) => {
      apps.push({
        title: app.name,
        subtitle: "Third-Party App",
        icon: app.icon,
        category: "thirdparty",
        function: app.function
      });
    });
  } catch (error) {
    console.error("Failed to load third-party apps:", error);
  }
  
  return apps;
}

function generateStartApps() {
  document.querySelector(".start-content").innerHTML = "";
  fetch("./apps/list.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((app) => {
        const item = document.createElement("div");
        item.className = "start-item";
        item.innerHTML = app.icon + "  " + app.name;
        item.addEventListener("click", () =>
          eval(
            app.function +
              "; document.querySelector('#start-menu').classList.remove('active');",
          ),
        );
        document.querySelector(".start-content").appendChild(item);
      });
    });
  fetch("./3rd_party_apps/list.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((app) => {
        const item = document.createElement("div");
        item.className = "start-item";
        item.innerHTML = app.icon + "  " + app.name;
        item.addEventListener("click", () =>
          eval(
            app.function +
              "; document.querySelector('#start-menu').classList.remove('active');",
          ),
        );
        document.querySelector(".start-content").appendChild(item);
      });
    });
}

function expose(func) {
  window[func] = func;
}

function auth_check() {
  const user = JSON.parse(localStorage.getItem("credentials"));
  if (user) {
    fetch(
      "http://" + window.location.host.split(":")[0] + ":9091" + "/api/login", {
		  method: "POST",
		  headers: {
			'Content-Type': 'application/json',
		  },
	  }
    )
      .then((response) => response.json())
      .then((data) => {
        const isuser = !data.error
        if (isuser) {
          createDesktopIcons();
        } else {
          localStorage.removeItem("credentials");
          window.location.href = "/login";
        }
      });
  } else {
    window.location.href = "/login";
  }
}

oncontextmenu = () => {
  return false;
};

function controlButtonEnter() {
  $(".control-button").css("font-size", "xx-small");
}
function controlButtonOut() {
  $(".control-button").css("font-size", "0");
}

$("#desktop").contextmenu(function (ev) {
  ev.preventDefault();
  if (ev.target.id == "desktop") {
    let menu = document.createElement("div");
    menu.id = "ctxmenu";
    menu.style = `top:${ev.pageY - 10}px;left:${ev.pageX - 40}px`;
    menu.onmouseleave = () => {
      window.addEventListener("click", () => (menu.outerHTML = ""));
      window.addEventListener("contextmenu", () => (menu.outerHTML = ""));
    };
    menu.onmouseenter = () => {
      window.removeEventListener("click", () => (menu.outerHTML = ""));
      window.removeEventListener("contextmenu", () => (menu.outerHTML = ""));
    };
    menu.innerHTML =
      "<p onclick='window.location.reload()'>Refresh</p><p onclick='terminal()'>Terminal</p><p onclick='settings()')'>Settings</p>";
    document.body.appendChild(menu);
  }
});

let windows = [];
let activeWindow = null;
let highestZIndex = 1;
function makeResizable(window, handle, direction) {
  handle.addEventListener("mousedown", initResize);
  function initResize(e) {
    e.stopPropagation();
    focusWindow(window);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = window.offsetWidth;
    const startHeight = window.offsetHeight;
    const startLeft = window.offsetLeft;
    const startTop = window.offsetTop;
    function resize(e) {
      if (direction.includes("e")) {
        const width = startWidth + (e.clientX - startX);
        if (width > 200) window.style.width = width + "px";
      }
      if (direction.includes("s")) {
        const height = startHeight + (e.clientY - startY);
        if (height > 100) window.style.height = height + "px";
      }
      if (direction.includes("w")) {
        const width = startWidth - (e.clientX - startX);
        const left = startLeft + (e.clientX - startX);
        if (width > 200) {
          window.style.width = width + "px";
          window.style.left = left + "px";
        }
      }
      if (direction.includes("n")) {
        const height = startHeight - (e.clientY - startY);
        const top = startTop + (e.clientY - startY);
        if (height > 100) {
          window.style.height = height + "px";
          window.style.top = top + "px";
        }
      }
    }

    function stopResize() {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    }

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  }
}

function createWindow(title, content, width = 400, height = 300, hidden = false, icon = "path") {
  const window = document.createElement("div");
 window.classList = ["window"];
 window.id = "window-" + title.toLowerCase().replace(" ", "-");
 window.style.width = width + "px";
 window.style.height = height + "px";
 window.style.left = Math.random() * (window.innerWidth - width) + "px";
 window.style.top = Math.random() * (window.innerHeight - height - 40) + "px";
 window.innerHTML = `
  <div class="window-header ${title.toLowerCase().replace(" ", "-")}-header">
  <span>${title}</span>
  <div class="window-controls ${title.toLowerCase().replace(" ", "-")}-controls">
  <div onmouseover="controlButtonEnter()" onmouseleave="controlButtonOut()" class="control-button maximize ${title.toLowerCase().replace(" ", "-")}-maximize"><center>+</center></div>
  <div onmouseover="controlButtonEnter()" onmouseleave="controlButtonOut()" class="control-button close ${title.toLowerCase().replace(" ", "-")}-close">X</div>
  </div>
  </div>
  <div class="window-content ${title.toLowerCase().replace(" ", "-")}-content">
 ${content}
  </div>
  `;
 const handles = [
  { class: "resize-n", style: "top: 0; left: 0; right: 0; height: 5px;" },
  { class: "resize-e", style: "top: 0; right: 0; bottom: 0; width: 5px;" },
  { class: "resize-s", style: "bottom: 0; left: 0; right: 0; height: 5px;" },
  { class: "resize-w", style: "top: 0; left: 0; bottom: 0; width: 5px;" },
  { class: "resize-ne", style: "top: 0; right: 0; width: 5px; height: 5px;" },
  { class: "resize-nw", style: "top: 0; left: 0; width: 5px; height: 5px;" },
  {
 class: "resize-se",
 style: "bottom: 0; right: 0; width: 5px; height: 5px;",
  },
  {
 class: "resize-sw",
 style: "bottom: 0; left: 0; width: 5px; height: 5px;",
  },
  ];
 handles.forEach((handle) => {
 const div = document.createElement("div");
 div.className = `resize-handle ${handle.class}`;
 div.style.cssText = `position: absolute; ${handle.style}`;
 window.appendChild(div);
 makeResizable(window, div, handle.class);
  });
 document.getElementById("desktop").appendChild(window);
 makeWindowDraggable(window);
 windows.push(window);
 window.addEventListener("mousedown", () => {
 focusWindow(window);
  });
 window.querySelector(".close").addEventListener("click", () => {
 closeWindow(window);
  });
 window.querySelector(".maximize").addEventListener("click", () => {
 maximizeWindow(window);
  });
 if (!hidden) {
   const titlemod = title ? title : "Settings";
   const taskbarIcon = document.createElement("span");
   taskbarIcon.className = "taskbar-icon start-button";
   taskbarIcon.dataset.windowId = window.id;
   taskbarIcon.title = titlemod;
   taskbarIcon.id = "start-button";
   taskbarIcon.style.position = "relative";
   taskbarIcon.style.top = "-15px";
   taskbarIcon.style.textAlign = "center";
   taskbarIcon.style.maxHeight = "40px";
   taskbarIcon.innerHTML = `${icon && icon != "path" ? icon : titlemod.charAt(0).toUpperCase()}`;
   taskbarIcon.addEventListener("click", () => {
     focusWindow(window);
   });
   taskbarIcon.addEventListener("destroy", () => {
    document.querySelector("#start-buttons").removeChild(taskbarIcon);
   });
   document.querySelector("#start-buttons").appendChild(taskbarIcon);
   if (isPhone() || isMobileUserAgent()) {
     maximizeWindow(window);
   }
  }
 focusWindow(window);
 return window;
 }

function focusWindow(window) {
  activeWindow = window;
  window.style.zIndex = ++highestZIndex;
}

function makeWindowDraggable(thewindow) {
  const header = thewindow.querySelector(".window-header");
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    focusWindow(thewindow);
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    thewindow.style.top = thewindow.offsetTop - pos2 + "px";
    thewindow.style.left = thewindow.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");

startButton.addEventListener("click", () => {
  startMenu.classList.toggle("active");
  generateStartApps();
});

function createDesktopIcons() {
  const apps = [
    { name: "Notes", icon: "📝" },
    { name: "Calculator", icon: "🧑‍💻" },
    { name: "Terminal", icon: "💻" },
    { name: "Settings", icon: "⚙️" },
  ];
  apps.forEach((app, index) => {
    const icon = document.createElement("div");
    icon.className = "desktop-icon";
    icon.style.position = "absolute";
    icon.style.left = "20px";
    icon.style.top = `${20 + index * 100}px`;

    icon.innerHTML = `
                      <div class="icon-img">${app.icon}</div>
                      <div class="icon-text">${app.name}</div>
                  `;

    icon.addEventListener("click", () =>
      eval(
        app.name.toLowerCase() +
          "(); document.querySelector('#start-menu').classList.remove('active');",
      ),
    );
    document.getElementById("desktop").appendChild(icon);
  });
}

function closeWindow(thewindow) {
  document.querySelector(`span[data-window-id="${thewindow.id}"]`).dispatchEvent(new Event("destroy"));
  thewindow.remove();
  windows = windows.filter((w) => w !== thewindow);
}

function maximizeWindow(window) {
  if (window.style.width === "100vw") {
    window.style.width = 500 + "px";
    window.style.height = 500 + "px";
    window.style.top = "50px";
    window.style.left = "50px";
  } else {
    window.style.width = "100vw";
    window.style.height = "calc(100vh - 40px)";
    window.style.top = "0";
    window.style.left = "0";
  }
}

auth_check();
