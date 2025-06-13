async function shutdown_now() {
  const os = await fetch(
    "http://" + window.location.host.split(":")[0] + ":9091" + "/api/system",
  );
  const osData = await os.json();
  if (osData.os === "win32") {
    await fetch(
      "http://" +
        window.location.host.split(":")[0] +
        ":9091" +
        "/api/terminal_exec?command=shutdown /s /t 0",
    );
  } else {
    await fetch(
      "http://" +
        window.location.host.split(":")[0] +
        ":9091" +
        "/api/terminal_exec?command=shutdown now",
    );
  }
}

function shutdown() {
  createWindow(
    "Shutdown",
    `<center>
        <div style="text-align: center;" class="shutdown-app">Are you sure you want to shutdown? <br>This will shutdown the server. <br><br><button class="shutdown-button" onclick="shutdown_now();">Shutdown</button></div></center>`,
    400,
    300,
    false,
    "&#x23FB;",
  );
}
