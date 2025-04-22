function jsexecnow() {
  document.getElementById("jsexec-status").innerHTML = eval(
    document.getElementById("jsexec-command").value,
  );
}

function jsexec() {
  createWindow(
    "jsexec",
    `
        <div style="display: flex; flex-direction: column; align-items: center;">
        <div id="jsexec-app">
            <input type="text" id="jsexec-command" placeholder="Code">
            <p class="nothing">NULL</p>
            <button onclick="jsexecnow();">Execute</button>
            <div id="jsexec-status"></div>
        </div>
        </div>
    `,
    400,
    300,
  );
}
