function loadApp() { // loadApp() loads the app
    const appName = document.getElementById('app-name').value;
    const scriptElement = document.createElement("script");
          scriptElement.src = `/apps/${appName}.js`;
          scriptElement.type = "text/javascript";
          document.body.appendChild(scriptElement);
          document.getElementById('app-status').innerHTML = `<p style="color: green;">/apps/${appName}.js loaded</p>`;
}

function loadapp() { // loadapp() shows the UI
    createWindow('Load an App', `
        <div style="display: flex; flex-direction: column; align-items: center;">
        <div id="app-app">
            <input type="text" id="app-name" placeholder="App Name">
            <p class="nothing">NULL</p>
            <button onclick="loadApp();">Load</button>
            <div id="app-status"></div>
        </div>
        </div>
    `, 400, 300);
}